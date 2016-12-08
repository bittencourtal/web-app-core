(function(){
    angular.module('mdThemeColorsDSS', [])
        .factory('mdThemeColorsDSS', ['mdThemeColors', function(mdThemeColors){
            return {
                init: function(){

                    var dictColors = [];
                    var colorCategories = Object.getOwnPropertyNames(mdThemeColors);

                    dss.values = dss.values || [];
                    dss.getKeys = function(){
                        return dss.values.select(function(v){
                            return v.key;
                        });
                    };

                    colorCategories.forEach(function(colorCategory, index){

                        var variations = Object.getOwnPropertyNames(mdThemeColors[colorCategory]);

                        variations.forEach(function(variation){
                            dictColors.push({
                                key: colorCategory + '.' + variation,
                                value: mdThemeColors[colorCategory][variation]
                            });
                        });

                    });

                    dictColors.forEach(function(color){
                        dss.setProperty(color.key, color.value);
                        dss.values.push(color);
                    });
                }
            };
        }]);
})();


String.prototype.contains = function(term){
	return this.indexOf(term) > -1;
};

String.prototype.replaceAll = function (from, to) {
	if (from == ".")
		return this.replace(/\./g, to);

	var rgx = new RegExp(from, 'g');
	return this.replace(rgx, to);
};
(function(global){

    global.isAndroid = function(){
        var ua = navigator.userAgent.toLowerCase();
        return ua.indexOf("android") > -1;
    };

    global.isIOS = function(){
        return /iPad|iPhone|iPod/.test(global.navigator.userAgent) && !global.MSStream;
    };

})(window);
(function (global) {

    var _modulesDependencies = [
        'squid-channel',
        'squid-campaign',
        'squid-login',
        'squid-feed',
        'squid-mission', // deprecated
        'squid-checkout',
        'squid-user',
        'squid-workflow'
    ];

    global.squid.app = angular.module("squid-app", global.squid.defaultDependencies.concat(_modulesDependencies));

    global.squid.app.run(
        ['$rootScope', 'auth', 'store', 'jwtHelper', '$location', 'WorkflowInitializer',
            function ($rootScope, auth, store, jwtHelper, $location, WorkflowInitializer) {
                $rootScope = $rootScope || {};

                function _redirectToLogin() {
                    $location.path(global.APP_CONFIG.LOGIN_ROUTE);
                }

                function _redirectToStartView() {
                    $location.path(global.APP_CONFIG.START_VIEW);
                }

                function _nextRouteRequireLogin(nextRoute) {
                    return nextRoute && nextRoute.$$route && nextRoute.$$route.requireLogin;
                }

                function _userAcceptedTerms() {
                    if (!auth.profile || !auth.profile.app_metadata)
                        return false;

                    return auth.profile.app_metadata.acceptedTerms;
                }

                function _logout() {
                    auth.signout();
                    store.remove('profile');
                    store.remove('token');
                    $.jStorage.flush();

                    if (global.APP_CONFIG.REQUIRE_AUTHENTICATION) {
                        _redirectToLogin();
                    } else {
                        _redirectToStartView();
                    }
                }

                $rootScope.pageTitle = "";

                $rootScope.setPageTitle = function (title) {
                    $rootScope.pageTitle = title;
                };

                $rootScope.$on('$locationChangeStart', function () {
                    var token = store.get('token');
                    if (token) {
                        if (!jwtHelper.isTokenExpired(token)) {
                            auth.authenticate(store.get('profile'), token);
                        } else {
                            $.jStorage.flush();
                        }
                    }

                    if (!auth.isAuthenticated) {
                        $.jStorage.flush();
                        if (global.APP_CONFIG.REQUIRE_AUTHENTICATION)
                            _redirectToLogin();

                        return;
                    }
                });

                $rootScope.$on('$routeChangeSuccess', function (e, nextRoute) {
                    WorkflowInitializer
                        .initWorkflows(global.APP_CONFIG.WORKFLOWS.ROUTES.CHANGED)
                        .catch(_logout);

                    if (_nextRouteRequireLogin(nextRoute) && !auth.isAuthenticated)
                        _redirectToLogin();
                });

                auth.hookEvents();
            }
        ]);

})(window);

(function(global){


    function _initializeThemeColorFactory($mdThemingProvider, $provide){
        var colorStore = {};

        function _populateColorStore(){
            Object.keys($mdThemingProvider._PALETTES).forEach(
                function(palleteName) {
                    var pallete = $mdThemingProvider._PALETTES[palleteName];
                    var colors  = [];
                    colorStore[palleteName]=colors;
                    Object.keys(pallete).forEach(function(colorName) {
                        if (/#[0-9A-Fa-f]{6}|0-9A-Fa-f]{8}\b/.exec(pallete[colorName])) {
                            colors[colorName] = pallete[colorName];
                        }
                    });
                });
        }

        function _bindFactoryColorProvider(){
            $provide.factory('mdThemeColors', [
                function() {
                    var service = {};

                    var getColorFactory = function(intent){
                        return function(){
                            var colors = $mdThemingProvider._THEMES['default'].colors[intent];
                            var name = colors.name

                            if(!colorStore[name])
                                _populateColorStore();

                            // Append the colors with links like hue-1, etc
                            colorStore[name].default = colorStore[name][colors.hues['default']]
                            colorStore[name].hue1 = colorStore[name][colors.hues['hue-1']]
                            colorStore[name].hue2 = colorStore[name][colors.hues['hue-2']]
                            colorStore[name].hue3 = colorStore[name][colors.hues['hue-3']]
                            return colorStore[name];
                        }
                    }

                    /**
                     * Define the getter methods for accessing the colors
                     */
                    Object.defineProperty(service,'primary', {
                        get: getColorFactory('primary')
                    });

                    Object.defineProperty(service,'accent', {
                        get: getColorFactory('accent')
                    });

                    Object.defineProperty(service,'warn', {
                        get: getColorFactory('warn')
                    });

                    Object.defineProperty(service,'background', {
                        get: getColorFactory('background')
                    });

                    return service;
                }
            ]);
        }

        _populateColorStore();
        _bindFactoryColorProvider();
    }

    function _createClientPallete($mdThemingProvider){
        if(global.APP_CONFIG.THEME.CUSTOM){
            $mdThemingProvider.definePalette(global.APP_CONFIG.THEME.PRIMARY_COLOR.name, global.APP_CONFIG.THEME.PRIMARY_COLOR.value);
            $mdThemingProvider._PALETTES[global.APP_CONFIG.THEME.PRIMARY_COLOR.name] = global.APP_CONFIG.THEME.PRIMARY_COLOR.value;

            $mdThemingProvider.definePalette(global.APP_CONFIG.THEME.SECONDARY_COLOR.name, global.APP_CONFIG.THEME.SECONDARY_COLOR.value);
            $mdThemingProvider._PALETTES[global.APP_CONFIG.THEME.SECONDARY_COLOR.name] = global.APP_CONFIG.THEME.SECONDARY_COLOR.value;

            $mdThemingProvider.definePalette(global.APP_CONFIG.THEME.WARN_COLOR.name, global.APP_CONFIG.THEME.WARN_COLOR.value);
            $mdThemingProvider._PALETTES[global.APP_CONFIG.THEME.WARN_COLOR.name] = global.APP_CONFIG.THEME.WARN_COLOR.value;
        }

        $mdThemingProvider.theme('default')
            .primaryPalette(global.APP_CONFIG.THEME.PRIMARY_COLOR.name)
            .accentPalette(global.APP_CONFIG.THEME.SECONDARY_COLOR.name)
            .warnPalette(global.APP_CONFIG.THEME.WARN_COLOR.name);

    }

    global.squid.app.config(
        ['$httpProvider', 'authProvider', 'jwtInterceptorProvider', '$mdThemingProvider','$mdIconProvider', '$provide', '$compileProvider', '$sceProvider',
            function($httpProvider, authProvider, jwtInterceptorProvider, $mdThemingProvider, $mdIconProvider, $provide, $compileProvider, $sceProvider) {
                $httpProvider.defaults.useXDomain = true;
                delete $httpProvider.defaults.headers.common['X-Requested-With'];

                authProvider.init({
                    domain: global.APP_CONFIG.AUTH0.DOMAIN,
                    clientID: global.APP_CONFIG.AUTH0.CLIENT_ID,
                    loginUrl: global.APP_CONFIG.LOGIN_ROUTE
                });

                jwtInterceptorProvider.tokenGetter = function(store) { return store.get('token'); };
                $httpProvider.interceptors.push('jwtInterceptor');
                $httpProvider.interceptors.push('appIdInjector');
                $httpProvider.interceptors.push('corsHeaderFilterInjector');
                $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension|whatsapp):/);
                $sceProvider.enabled(false);

                _createClientPallete($mdThemingProvider);
                _initializeThemeColorFactory($mdThemingProvider, $provide);
            }
        ]);

})(window);

(function (global) {
    "use strict";

    global.squid.app.controller('TemplateController', [
        '$scope',
        '$rootScope',
        'auth',
        '$location',
        '$mdMedia',
        'mdThemeColorsDSS',
        function ($scope,
                  $rootScope,
                  auth,
                  $location,
                  $mdMedia,
                  mdThemeColorsDSS) {

            $scope = $scope || {};
            $rootScope.pageTitle = "";
            $rootScope.secondaryNav = false;
            $rootScope.isSmallDevice = $mdMedia('sm');
            $scope.isLoading = false;
            $scope.viewUrl = "";
            $scope.auth = auth;
            $scope.$location = $location;
            $scope.path = $location.$$path.split("/")[1];
            $scope.toggleObject = {item: -1};
            $scope.APP_DIR = global.APP_CONFIG.APP_DIR;

            $scope.scrollToUp = function(){
                $('html, body').animate({
                    scrollTop: 0
                }, 1500);
            };

            $scope.$on('$routeChangeStart', function() {
                $scope.isLoading = true;
            });

            $scope.$on('$routeChangeError', function() {
                $scope.isLoading = false;
            });

            $scope.$on('$routeChangeSuccess', function (e, nextRoute) {
                $rootScope.pageTitle = nextRoute && nextRoute.$$route ? nextRoute.$$route.pageTitle : "";
                $scope.viewUrl = nextRoute && nextRoute.$$route ? nextRoute.$$route.viewUrl : "";
                $rootScope.secondaryNav = nextRoute && nextRoute.$$route ? nextRoute.$$route.secondaryNav : false;
                $scope.path = $location.$$path.split("/")[1];
                $scope.isLoading = false;
            });

            mdThemeColorsDSS.init();
        }
    ]);

})(window);

(function(global){
    "use strict";

    global.squid.app.factory('addressService', ['$resource', function($resource){
        return $resource('https://viacep.com.br/ws/:cep/json/', {
            cep: '@cep'
        });
    }]);

})(window);
(function (global) {
    "use strict";

    global.squid.app.directive('toolbar', ['$rootScope', '$mdSidenav', '$location', 'auth', 'store', '$mdMedia', 'AboutCampaignModalService', 'feedService', 'uniqueCampaignService',
        function ($rootScope, $mdSidenav, $location, auth, store, $mdMedia, AboutCampaignModalService, feedService, uniqueCampaignService) {
            return {
                templateUrl: global.APP_CONFIG.APP_DIR + '/directives/toolbar/toolbar.html',
                restrict: 'EA',
                replace: true,
                scope: {},
                link: function ($scope, $element, $attrs, $controllers) {

                    $scope.APP_CONFIG = global.APP_CONFIG;
                    $scope.$mdSidenav = $mdSidenav;
                    $scope.path = $location.$$path.split("/")[1];
                    $scope.auth = auth;
                    $scope.$location = $location;
                    $scope.uniqueCampaign = null;
                    $scope.isSmallDevice = $mdMedia('sm');
                    $scope.mobileSideMenuUrl = global.APP_CONFIG.APP_DIR + '/directives/toolbar/mobile-side-menu.html';

                    function _logout() {
                        auth.signout();
                        store.remove('profile');
                        store.remove('token');
                        $.jStorage.flush();
                        _redirectToLogin();
                    }

                    function _redirectToLogin() {
                        $location.path(global.APP_CONFIG.LOGIN_ROUTE);
                    }

                    function _redirectToStartView() {
                        $location.path(global.APP_CONFIG.START_VIEW);
                    }

                    function _loadUniqueCampaign() {
                        if (!global.APP_CONFIG.CAMPAIGNS.UNIQUE_CAMPAIGN.IS_UNIQUE)
                            return;

                        uniqueCampaignService.getUniqueCampaign()
                            .then(function (campaign) {
                                $scope.uniqueCampaign = campaign;
                            });
                    }

                    $scope.getButtonClass = function (menu) {
                        return {
                            'active': $scope.path == menu
                        };
                    };

                    $scope.goBack = function () {
                        window.history.go(-1);
                    };

                    $scope.vincularConta = function () {
                        try {
                            var data = {
                                userId: auth.profile.user_id,
                                redirectUrl: window.location.href,
                                email: auth.profile.email
                            };

                            var dataStr = JSON.stringify(data);
                            var dataEncode = btoa(dataStr);
                            window.open('https://campanhas.squidit.com.br/v1/vincular-instagram?data=' + dataEncode, '_blank');
                        } catch (e) {
                            console.log(e);
                        }
                    };

                    $scope.goToUniqueCampaign = function () {
                        if (!$scope.uniqueCampaign)
                            return uniqueCampaignService.notifyNotHaveCampaign();

                        uniqueCampaignService.redirectToUniqueCampaign($scope.uniqueCampaign);
                    };

                    $scope.goToUniqueCampaignRank = function () {
                        if (!$scope.uniqueCampaign)
                            return uniqueCampaignService.notifyNotHaveCampaign();

                        uniqueCampaignService.redirectToUniqueCampaignRank($scope.uniqueCampaign);
                    };

                    $scope.openAboutCampaign = function () {
                        AboutCampaignModalService.openDialog(auth.profile)
                            .then(function () {}, _logout);
                    };

                    $scope.logout = function () {
                        auth.signout();
                        store.remove('profile');
                        store.remove('token');
                        $.jStorage.flush();

                        if (global.APP_CONFIG.REQUIRE_AUTHENTICATION) {
                            _redirectToLogin();
                        } else {
                            _redirectToStartView();
                        }
                    };

                    _loadUniqueCampaign();
                }
            }
        }
    ]);

})(window);
(function (global) {

    global.squid.app.factory('appIdInjector', [function () {
        return {
            request: function (config) {
                config.headers['app_id'] = global.APP_CONFIG.APP_ID();
                return config;
            }
        };
    }]);

})(window);
(function (global) {

    global.squid.app.factory('corsHeaderFilterInjector', [function () {

        function _isRequestForSquidApi(url) {
            return url.startsWith(global.APP_CONFIG.END_POINT_URL()) ||
                url.startsWith(global.APP_CONFIG.CAMPAIGN_END_POINT_URL()) ||
                url.startsWith(global.APP_CONFIG.SPIDERMAN_END_POINT_URL());
        }

        return {
            request: function (config) {
                if (_isRequestForSquidApi(config.url))
                    return config;

                delete config.headers.app_id;
                delete config.headers.Authorization;
                return config;
            }
        };
    }]);

})(window);
(function (global) {
    "use strict";

    global.squid.app.factory('syncPromise', ['$q', function ($q) {
        return function (fn) {
            return function (previouPromiseResponse) {
                var defer = $q.defer();
                
                defer.resolve(fn(previouPromiseResponse));

                return defer.promise;
            }
        }
    }]);

})(window);
(function(global) {

    global.squid.app.config(['$routeProvider', function($routeProvider) {
        $routeProvider
            .otherwise({
                redirectTo: global.APP_CONFIG.START_VIEW
            });
    }]);

})(window);

(function (global) {

    global.squid.campaign = angular.module("squid-campaign", []);
    global.squid.campaign.controllers = {};

})(window);
(function (global) {

    global.squid.channel = angular.module("squid-channel", []);
    global.squid.channel.controllers = {};

})(window);
(function(global) {

	global.squid.checkout = angular.module("squid-checkout", []);
	global.squid.checkout.controllers = {};

})(window);
(function(global) {

	global.squid.feed = angular.module("squid-feed", []);

})(window);
(function (global) {

	global.squid.login = angular.module("squid-login", []);
	global.squid.login.controllers = {};

})(window);
(function(global) {

	global.squid.mission = angular.module("squid-mission", []);

})(window);
(function (global) {

    global.squid.workflow = angular.module("squid-workflow", []);
    global.squid.workflow.controllers = {};
    global.squid.workflow.models = {};

})(window);
(function(global) {

	global.squid.user = angular.module("squid-user", []);
	global.squid.user.controllers = {};

})(window);
(function (global) {
    "use strict"

    function AboutCampaignDialogController($scope, $mdDialog, store, AboutCampaignModalService) {

        $scope.TEXTS = global.APP_CONFIG.CAMPAIGNS.UNIQUE_CAMPAIGN.ABOUT.TEXTS;
        $scope.currentText = ($scope.TEXTS.length > 0) ?
            $scope.TEXTS.first() : {};

        $scope.isFirstText = function (text) {
            return $scope.TEXTS.first().ORDER == text.ORDER;
        };

        $scope.isLastText = function (text) {
            return $scope.TEXTS.last().ORDER == text.ORDER;
        };

        $scope.isCurrentText = function (text) {
            return $scope.currentText.ORDER == text.ORDER;
        };

        $scope.back = function () {
            var _previousText = $scope.TEXTS.first(function (text) {
                return text.ORDER < $scope.currentText.ORDER;
            });
            $scope.currentText = !!_previousText ? _previousText : $scope.currentText;
        };

        $scope.next = function () {
            var _nextText = $scope.TEXTS.first(function (text) {
                return text.ORDER > $scope.currentText.ORDER;
            });
            $scope.currentText = !!_nextText ? _nextText : $scope.currentText;
        };

        $scope.ok = function () {
            AboutCampaignModalService.storeAboutCampaignAnswer(true);
            $mdDialog.hide();
        };
    }

    global.squid.campaign.controllers.AboutCampaignDialogController = AboutCampaignDialogController;
    global.squid.campaign.controller('AboutCampaignDialogController', ['$scope', '$mdDialog', 'store', 'AboutCampaignModalService', AboutCampaignDialogController]);

})(window);
(function(global){
    "use strict";

    global.squid.campaign.controller('CampaignRankController', [
        '$scope', 'campaignServicePtBr', '$routeParams', '$q', '$mdMedia',
        function($scope, campaignService, $routeParams, $q, $mdMedia){

        $scope.isLoading = false;
        $scope.campaignRank = [];
        $scope.isSmallDevice = $mdMedia('sm');

        function _getCampaignRank(){
            var defer = $q.defer();

            campaignService.getRank({
                idCampaign: $routeParams.campaignId
            }, defer.resolve, defer.reject);

            return defer.promise;
        }

        function _populateCampaign(rank){
            $scope.campaignRank = rank;
        }

        function _showLoader(){
            $scope.isLoading = true;
        }

        function _hideLoader(){
            $scope.isLoading = false;
        }

        function _init(){
            _showLoader();
            _getCampaignRank()
                .then(_populateCampaign)
                .then(_hideLoader);
        }

        _init();
    }]);

})(window);
(function (global) {
  "use strict"

  var toastConfig = {
    delay: 10000,
    close: 'OK'
  };

  function TermsOfUseDialogController($scope, $rootScope, $timeout, $location, store, $mdDialog, userService, $q, $mdToast, auth, squidSpidermanService) {
    $scope.isLoading = false;
    $scope.TERMS_OF_USE = global.APP_CONFIG.TERMS_OF_USE;

    function _getToastPosition() {
      if ($rootScope.isSmallDevice) {
        return 'bottom left';
      } else {
        return 'top right';
      }
    }

    function _getProfile() {
      return store.get('profile');
    }

    function _getUserMetadata() {
      var userProfile = _getProfile();

      if (!userProfile.user_metadata || !userProfile.user_metadata.infos)
        return null;

      return userProfile.user_metadata.infos.first(function (userMetadata) {
        return userMetadata.channelId == global.APP_CONFIG.APP_ID();
      });
    }

    function _updateUserMetadata(userMetadata) {
      var defer = $q.defer();

      squidSpidermanService.updateUserMetadata(userMetadata, defer.resolve, defer.reject);

      return defer.promise;
    }

    function _answerTerms(answer) {
      var userMetadata = _getUserMetadata();

      if (!userMetadata)
        userMetadata = {};

      userMetadata.acceptedTerms = answer;
      return _updateUserMetadata(userMetadata);
    }

    function _logout() {
      auth.signout();
      store.remove('profile');
      store.remove('token');
      $.jStorage.flush();
      $rootScope.$broadcast('refreshLogin');
      _redirectToLogin();
    }

    function _redirectToLogin() {
      $location.path(global.APP_CONFIG.LOGIN_ROUTE);
    }

    function _termsDisagreed() {
      var defer = $q.defer();

      _answerTerms(false)
        .then(defer.resolve, defer.reject);

      var toast = $mdToast.simple()
        .content('Para participar da(s) campanha(s) você deve concordar com o regulamento.')
        .action(toastConfig.close)
        .parent($('main').get(0))
        .hideDelay(toastConfig.delay)
        .highlightAction(false)
        .position(_getToastPosition());

      _logout();
      $timeout(function () {
        $mdToast.show(toast).then(function (result) {});
      }, 800);

      return defer.promise;
    }

    function _termsAgreed() {
      var defer = $q.defer();

      _answerTerms(true)
        .then(defer.resolve, defer.reject);

      return defer.promise;
    }

    function _closeModal() {
      $mdDialog.hide();
    }

    function _cancelModal() {
      $mdDialog.cancel();
    }

    function _stopLoadingAndCloseModal() {
      _closeModal();
      $scope.isLoading = false;
    }

    function _stopLoadingAndCancelModal() {
      _cancelModal();
      $scope.isLoading = false;
    }

    $scope.agree = function () {
      $scope.isLoading = true;
      _termsAgreed()
        .then(_stopLoadingAndCloseModal)
        .catch(_stopLoadingAndCancelModal);
    };

    $scope.disagree = function () {
      $scope.isLoading = true;
      _termsDisagreed()
        .then(_stopLoadingAndCloseModal)
        .catch(_stopLoadingAndCancelModal);
    };
  }

  global.squid.campaign.controllers.TermsOfUseDialogController = TermsOfUseDialogController;
  global.squid.campaign.controller('TermsOfUseDialogController', [
    '$scope',
    '$rootScope',
    '$timeout',
    '$location',
    'store',
    '$mdDialog',
    'userService',
    '$q',
    '$mdToast',
    'auth',
    'squidSpidermanService',
    TermsOfUseDialogController
  ]);

})(window);
(function (global) {

    global.squid.campaign.config(['$routeProvider', function ($routeProvider) {
        $routeProvider
            .when('/campaign/rank/:campaignId', {
                viewUrl: global.APP_CONFIG.APP_DIR + '/modules/campaign/views/campaign-rank.html',
                templateUrl: global.APP_CONFIG.VIEWS.TEMPLATES.DEFAULT(),
                pageTitle: 'Rank influenciadores'
            });
    }]);

})(window);
(function (global) {

    var toastConfig = {
        delay: 10000,
        close: 'OK'
    };

    var _campaignControllers = global.squid.campaign.controllers;

    global.squid.login.factory('AboutCampaignModalService', ['$q', 'store', '$mdDialog',
        function ($q, store, $mdDialog) {

            function _openDialog() {
                var defer = $q.defer();

                $mdDialog.show({
                    controller: _campaignControllers.AboutCampaignDialogController,
                    templateUrl: global.APP_CONFIG.APP_DIR + '/modules/campaign/views/about-campaign-dialog.html',
                    parent: angular.element(document.body),
                    clickOutsideToClose: false,
                    escapeToClose: false
                }).then(defer.resolve, defer.reject);

                return defer.promise;
            }

            function _aboutCampaignIsRead() {
                var _aboutCampaignRead = store.get('about-campaign-read');

                if (!_aboutCampaignRead || !_aboutCampaignRead.read || _aboutCampaignRead.channelId != global.APP_CONFIG.APP_ID())
                    return false;

                return _aboutCampaignRead.read;
            }

            function _storeAboutCampaignAnswer(answer) {
                store.set('about-campaign-read', {
                    channelId: global.APP_CONFIG.APP_ID(),
                    read: answer
                });
            }

            return {
                openDialog: _openDialog,
                aboutCampaignIsRead: _aboutCampaignIsRead,
                storeAboutCampaignAnswer: _storeAboutCampaignAnswer
            }
        }
    ]);

})(window);
(function(global, appConfig){
    "use strict";

    global.squid.channel.factory('channelService', ['$resource', function($resource){
        var channelId = appConfig.APP_ID();
        return $resource(appConfig.CAMPAIGN_END_POINT_URL() + '/channels/' + channelId + '/:resource/:resourceId/:action/:actionId', {
                resource: '@resource',
                resourceId: '@resourceId',
                action: '@action',
                actionId: '@actionId'
            }, {
                getActiveCampaigns: {
                    method: 'GET',
                    params: {
                        resource: 'campaigns',
                        action: 'active'
                    },
                    isArray: true
                },
                getCampaign: {
                   method: 'GET',
                    params: {
                        resource: 'campaigns'
                    } 
                },
                getCampaignPrizes: {
                    method: 'GET',
                    params: {
                        resource: 'campaigns',
                        action: 'prizes'
                    },
                    isArray: true
                },
                getSelfPoints: {
                    method: 'GET',
                    params: {
                        resource: 'self',
                        action: 'points',
                    },
                    isArray: true
                },
                createCheckout: {
                    method: 'POST',
                    url: appConfig.CAMPAIGN_END_POINT_URL() + '/channels/' + channelId + '/campaigns/:resourceId/prizes/:action/checkout'
                },
                getPrize: {
                    method: 'GET',
                    params: {
                        resource: 'campaigns',
                        action: 'prizes'
                    }
                }
            });
    }]);

})(window, window.APP_CONFIG);
(function (global) {
	"use strict";

	global.squid.checkout.controller('CheckoutController', [
		'$scope', 'channelService',
		function ($scope, channelService) {

			$scope.APP_CONFIG = global.APP_CONFIG;

		}
	]);

})(window);
(function (global) {
	"use strict";

	function CheckoutDialogController(
		$scope,
		$q,
		$mdDialog,
		$mdToast,
		channelService,
		campaignId,
		prize,
		saveUserMetadataFn,
		checkoutPrizeFn
	) {

		$scope.isLoading = false;
		$scope.checkoutDone = false;
		$scope.userPointsAvailable = 0;
		$scope.checkoutSuccess = false;
		$scope.prize = prize;
		$scope.checkoutResultMessage = '';

		function _getPointsAvailable() {
			return channelService.getSelfPoints({})
                .$promise
				.then(function (data) {
					return data.filter(function (d) {
						return d.campaign.id === campaignId;
					})[0];
				});
		}

		function _successCheckout(result) {
			$scope.checkoutResultMessage = result.message;
			$scope.checkoutDone = true;
		}

		function _failCheckout(err) {
			var data = err.data;
			$scope.checkoutResultMessage = data.message;
			$scope.checkoutDone = false;
			_hideLoader();
		}

		function _showLoader() {
			$scope.isLoading = true;
		}

		function _hideLoader() {
			$scope.isLoading = false;
		}

		function _populatePointsAvailable(result) {
			$scope.userPointsAvailable = result.totalAvaible;
            $scope.isLoading = false;
		}

		function _resetResultMessage() {
			$scope.checkoutResultMessage = '';
		}

		function _init() {
            $scope.isLoading = true;
			_getPointsAvailable()
				.then(_populatePointsAvailable);
		}

		$scope.doCheckout = function () {
			_showLoader();
			saveUserMetadataFn()
				.then(checkoutPrizeFn)
				.then(_successCheckout)
				.then(_hideLoader)
				.catch(_failCheckout);
		};

		$scope.cancel = function () {
			_resetResultMessage();
			$mdDialog.cancel();
		};

		$scope.ok = function () {
			_resetResultMessage();
			$mdDialog.hide($scope.checkoutDone);
		};

		_init();
	}

	global.squid.checkout.controller('CheckoutDialogController', [
		'$scope',
		'$q',
		'$mdDialog',
		'$mdToast',
		'checkoutService',
		'campaignId',
		'prize',
		'saveUserMetadataFn',
		'checkoutPrizeFn',
		CheckoutDialogController
	]);
	global.squid.checkout.controllers.CheckoutDialogController = CheckoutDialogController;

})(window);
(function (global) {
    "use strict";

    var toastConfig = {
        delay: 30000,
        close: 'OK'
    };

    var _checkoutControllers = global.squid.checkout.controllers;

    global.squid.checkout.controller('CheckoutPrizeController', [
        '$scope',
        '$rootScope',
        'userService',
        'channelService',
        '$mdToast',
        '$mdDialog',
        '$routeParams',
        'auth',
        '$location',
        function (
            $scope,
            $rootScope,
            userService,
            channelService,
            $mdToast,
            $mdDialog,
            $routeParams,
            auth,
            $location) {
            $scope.auth = auth;
            $scope.userMetadata = {};
            $scope.isLoading = false;
            $scope.prize = {};

            var campaignId = $routeParams.campaignId;
            var prizeId = $routeParams.prizeId;

            function _getToastPosition() {
                if ($rootScope.isSmallDevice) {
                    return 'bottom left';
                } else {
                    return 'top right';
                }
            }

            function _getPrize() {
                return channelService.getPrize({
                    resourceId: campaignId,
                    actionId: prizeId
                }).$promise;
            }

            function _checkoutPrize() {
                var campaignId = $scope.prize.mission;
                return channelService.createCheckout({
                    resourceId: campaignId,
                    action: prizeId
                }).$promise;
            }

            function _openConfirmCheckoutModal() {
                return $mdDialog.show({
                    controller: _checkoutControllers.CheckoutDialogController,
                    templateUrl: global.APP_CONFIG.APP_DIR + '/modules/checkout/views/checkout-dialog.html',
                    parent: angular.element(document.body),
                    clickOutsideToClose: false,
                    escapeToClose: false,
                    locals: {
                        campaignId: campaignId,
                        saveUserMetadataFn: $scope.saveUserMetadata,
                        checkoutPrizeFn: _checkoutPrize,
                        prize: $scope.prize
                    }
                });
            }

            function _checkoutDone(success){
                if(!success)
                    return;

                $location.path('checkout');
            }

            function _init() {
                $scope.isLoading = true;
                _getPrize()
                    .then(function (prize) {
                        $scope.prize = prize;
                        $scope.isLoading = false;
                    });
            }

            $scope.saveUserMetadata = function () {}; // user-metadata-directive will override this method!

            $scope.rescue = function () {
                _openConfirmCheckoutModal()
                    .then(_checkoutDone);
            };

            _init();
        }
    ]);

})(window);
(function (global) {

    global.squid.checkout.config(['$routeProvider', function ($routeProvider) {
        $routeProvider
            .when('/checkout', {
                viewUrl: global.APP_CONFIG.APP_DIR + '/modules/checkout/views/checkout.html',
                templateUrl: global.APP_CONFIG.VIEWS.TEMPLATES.DEFAULT(),
                pageTitle: 'Meus Pontos',
                requireLogin: true
            })
            .when('/checkout/campaigns/:campaignId/prize/:prizeId', {
                viewUrl: global.APP_CONFIG.APP_DIR + '/modules/checkout/views/checkout-prize.html',
                templateUrl: global.APP_CONFIG.VIEWS.TEMPLATES.DEFAULT(),
                pageTitle: 'Resgatar prêmio',
                secondaryNav: true,
                requireLogin: true
            });
    }]);

})(window);

(function (global) {
    "use strict";

    global.squid.checkout.factory('checkoutService', ['$resource', function ($resource) {
        return $resource(global.APP_CONFIG.CAMPAIGN_END_POINT_URL() + '/checkouts/:resource/:resourceId', {
            resource: '@resource',
            resourceId: '@resourceId'
        }, {
            getUserCheckouts: {
                method: 'GET',
                params: {
                    resource: 'user',
                    resourceId: 'self'
                },
                isArray: true
            }
        });
    }]);

})(window);
(function (global, config) {
    "use strict";

    var _manualPausedVideos = [];

    global.squid.feed.controller('FeedController', [
        '$scope', 'feedService', '$element', '$timeout', '$q',
        function ($scope, feedService, $element, $timeout, $q) {

            $scope.feedList = [];
            $scope.paginationMetadata = {};
            $scope.isLoading = false;

            function _autoPlayVideosOnScreen() {
                var videos = $($element).find('video').not("[autoplay='autoplay']");
                var tolerancePixel = 80;

                function _hasPausedManualy(video){
                    return _manualPausedVideos.any(function(manualPausedVideo){
                        return manualPausedVideo.currentSrc == video.currentSrc;
                    });
                }

                function _playVideo(video){
                    if(_hasPausedManualy(video))
                        return;

                    video.play();
                }

                function _videoIsVisible(scrollTop, yBottomMedia, scrollBottom, yTopMedia){
                    return scrollTop < yBottomMedia && scrollBottom > yTopMedia;
                }

                function _checkMedia() {
                    var scrollTop = $(window).scrollTop() + tolerancePixel;
                    var scrollBottom = $(window).scrollTop() + $(window).height() - tolerancePixel;

                    videos.each(function (index, el) {
                        var yTopMedia = $(this).offset().top;
                        var yBottomMedia = $(this).height() + yTopMedia;
                        var $video = $(this).get(0);

                        if (_videoIsVisible(scrollTop, yBottomMedia, scrollBottom, yTopMedia))
                            _playVideo($video);
                        else
                            $video.pause();
                    });
                }

                $(document).unbind('scroll');
                $(document).on('scroll', _checkMedia);
            }

            function _handleVideoEvents() {
                var $videos = $($element).find('video');

                function _attachVideoEvent(index, $video) {
                    var $card = $($video).closest('.card');
                    $video.onplay = function () {
                        $card.addClass('video-playing');
                    };

                    $video.onpause = function () {
                        $card.removeClass('video-playing');
                    };
                }

                $.each($videos, _attachVideoEvent);
            }

            function _attachEvents(){
                var defer = $q.defer();

                $timeout(function(){
                    _handleVideoEvents();
                    _autoPlayVideosOnScreen();
                    defer.resolve();
                }, 100);

                return defer.promise;
            }

            function _populateFeedList(result){
                var defer = $q.defer();

                $scope.feedList = $scope.feedList.concat(result.data);
                $scope.paginationMetadata = result.paginationMetadata;
                defer.resolve();

                return defer.promise;
            }

            function _stopLoading(){
                $scope.isLoading = false;
            }

            function _loadFeed(minId){
                $scope.isLoading = true;

                _getFeed(minId)
                    .then(_populateFeedList)
                    .then(_attachEvents)
                    .then(_stopLoading);
            }

            function _getFeed(minId) {
                var defer = $q.defer();
                var query = { };

                if (config.ONLY_APPROVED) {
                    query.status = 'approved';
                }
                if (minId)
                    query.minId = minId;

                feedService.getFeedParticipation(query, defer.resolve, defer.reject);

                return defer.promise;
            }

            $scope.getCardClass = function (feedItem) {
                var objClass = {};
                objClass['card-feed-' + feedItem.mediaType] = true;

                return objClass;
            }

            $scope.playVideo = function ($event, feedItem) {
                var $video = $($event.currentTarget).get(0);
                if (!$video)
                    return;

                if ($video.paused)
                    return $video.play();

                _manualPausedVideos.push($video);
                _manualPausedVideos = _manualPausedVideos.distinct(function(v1, v2){
                    return v1.currentSrc == v2.currentSrc;
                });
                return $video.pause();
            };

            $scope.loadMore = function () {
                if ($scope.isLoading || !$scope.paginationMetadata.next)
                    return;

                _loadFeed($scope.paginationMetadata.next.minId);
            };

            _loadFeed();
        }]);

})(window, window.APP_CONFIG.CAMPAIGNS);

(function (global) {

    global.squid.feed.config(['$routeProvider', function ($routeProvider) {
        $routeProvider
            .when('/feed', {
                viewUrl: global.APP_CONFIG.APP_DIR + '/modules/feed/views/feed.html',
                templateUrl: global.APP_CONFIG.VIEWS.TEMPLATES.DEFAULT(),
                pageTitle: 'Feed'
            });
    }]);

})(window);
(function (global) {
    "use strict";

    global.squid.feed.factory('feedService', ['$resource',
        function ($resource) {
            return $resource(global.APP_CONFIG.END_POINT_URL() + '/api/feed/:action/:id', {
                action: '@action',
                id: '@id'
            }, {
                getFeedParticipation: {
                    method: 'GET',
                    params:{
                        action: 'participation'
                    }
                },
                getMissionsActive: {
                    method: 'GET',
                    params:{
                        action: 'mission'
                    }
                }
            });
        }
    ]);

})(window);
/* jshint undef: true, unused: false */
/* global app, window */

(function (global) {

    var toastConfig = {
        delay: 10000,
        close: 'OK'
    };

    var _campaignControllers = global.squid.campaign.controllers;
    var _loginControllers = global.squid.login.controllers;
    var _isFirstTimeLogin = true;
    var $document = angular.element(document);

    global.squid.login.controller('LoginController', [
        '$scope', '$rootScope', 'auth', '$location', '$timeout', 'store', '$mdDialog', '$mdToast', '$q', 'userService', 'WorkflowInitializer',
        function ($scope, $rootScope, auth, $location, $timeout, store, $mdDialog, $mdToast, $q, userService, WorkflowInitializer) {
            $scope.isLoading = false;

            var dict = {
                loadingTitle: 'carregando...',
                close: 'fechar',
                signin: {
                    title: 'Seja bem-vindo!',
                    signinText: 'Entrar',
                    signupText: 'Cadastrar-se',
                    usernamePlaceholder: 'e-mail',
                    emailPlaceholder: 'e-mail',
                    passwordPlaceholder: "Senha",
                    separatorText: "ou",
                    wrongEmailPasswordErrorText: 'E-mail ou senha inválidos.',
                    serverErrorText: 'Você não está autorizado.',
                    strategyEmailInvalid: 'O e-mail é invalido.',
                    strategyDomainInvalid: 'O domínio {domain} não foi configurado.',
                    returnUserLabel: 'Da última vez você acessou como...',
                    all: 'Não é sua conta?',
                    forgotText: 'Esqueceu sua senha? Clique aqui.'
                },
                signup: {
                    serverErrorText: 'Não foi possível se cadastrar.'
                },
                reset: {
                    serverErrorText: 'Não foi possível resetar a senha.'
                }
            };

            function _logout() {
                auth.signout();
                store.remove('profile');
                store.remove('token');
                $.jStorage.flush();
                _hideLoader();
                _redirectToLogin();
            }

            function _redirectToLogin() {
                $timeout(function () {
                    $location.path(global.APP_CONFIG.LOGIN_ROUTE);
                }, 500);
            }

            function _redirectIfIsLoggedIn() {
                var defer = $q.defer();

                if (!auth.isAuthenticated) {
                    defer.resolve();
                    return defer.promise;;
                }

                _loggedIn()
                    .then(defer.resolve, defer.reject);

                return defer.promise;
            }

            function _hideLoader() {
                var defer = $q.defer();

                $scope.isLoading = false;
                defer.resolve();

                return defer.promise;
            }

            function _showLoader() {
                var defer = $q.defer();

                $scope.isLoading = true;
                defer.resolve();

                return defer.promise;
            }

            function _initWorkflow() {
                return WorkflowInitializer
                    .initWorkflows(global.APP_CONFIG.WORKFLOWS.LOGIN.AFTER);
            }

            function _loggedIn() {
                return _showLoader()
                    .then(_initWorkflow)
                    .then(_hideLoader);
            }

            function _initAsyncMode() {
                auth.signin({
                    connections: ['instagram'],
                    container: 'login-box',
                    icon: '../images/logo.png',
                    dict: dict
                }, function (profile, token) {
                    store.set('profile', profile);
                    store.set('token', token);
                    _loggedIn();
                }, function (error) {

                });
            }

            function _initRedirectMode() {
                auth.signin({
                    connections: ['instagram'],
                    container: 'login-box',
                    icon: '../images/logo.png',
                    dict: dict
                });
            }

            function _initAuthLockComponent() {
                $scope.isLoading = false;
                auth.config.auth0lib.$container = null;

                if (global.APP_CONFIG.USE_LOGIN_REDIRECT_MODE)
                    _initRedirectMode();
                else
                    _initAsyncMode();
            }

            _redirectIfIsLoggedIn()
                .then(_initAuthLockComponent);

            $rootScope.$on('refreshLogin', _initAuthLockComponent);
        }
    ]);

    function _configureEventsHandlersToRedirectMode() {
        global.squid.login.config(['authProvider', function (authProvider) {

            authProvider.on('loginSuccess', function ($location, profilePromise, idToken, store) {
                profilePromise.then(function (profile) {
                    store.set('profile', profile);
                    store.set('token', idToken);
                    $document.trigger('loggedIn');
                });
            });

            authProvider.on('authenticated', function ($location) {
                if(!_isFirstTimeLogin)
                    return;

                $document.trigger('loggedIn');
            });

            authProvider.on('loginFailure', function ($location, error) {

            });
        }]);

        global.squid.login.run(['WorkflowInitializer', function (WorkflowInitializer) {

            function _initWorkflow() {
                return WorkflowInitializer
                    .initWorkflows(global.APP_CONFIG.WORKFLOWS.LOGIN.AFTER);
            }

            $document.on('loggedIn', function(){
                _isFirstTimeLogin = false;
                _initWorkflow();
            });
        }])
    }

    if (global.APP_CONFIG.USE_LOGIN_REDIRECT_MODE)
        _configureEventsHandlersToRedirectMode();

})(window);
(function (global) {

    global.squid.login.config(['$routeProvider', function ($routeProvider) {
        $routeProvider
            .when('/login', {
                viewUrl: global.APP_CONFIG.APP_DIR + '/modules/login/views/index.html',
                templateUrl: global.APP_CONFIG.VIEWS.TEMPLATES.LOGIN,
                pageTitle: 'Login',
                secondaryNav: true
            });
    }]);

})(window);
(function (global) {
    "use strict";

    global.squid.mission.controller('ActiveMissionController', [
        '$scope', 'channelService', '$mdToast', 'uniqueCampaignService',
        function ($scope, channelService, $mdToast, uniqueCampaignService) {
            $scope.campaigns = [];
            $scope.isLoading = false;

            function _redirectToUniqueMission() {
                $scope.isLoading = true;

                uniqueCampaignService.getUniqueCampaign()
                    .then(function (campaign) {
                        uniqueCampaignService.redirectToUniqueCampaign(campaign);
                        $scope.isLoading = false;
                    })
                    .catch(function () {
                        uniqueCampaignService.notifyNotHaveCampaign();
                        $scope.isLoading = false;
                    });
            }

            function _loadCampaigns() {
                $scope.isLoading = true;

                channelService.getActiveCampaigns({})
                    .$promise
                    .then(function (result) {
                        $scope.campaigns = result;
                        $scope.isLoading = false;
                    })
                    .catch(function (err) {
                        $scope.isLoading = false;
                    });
            }

            function _init() {
                if (APP_CONFIG.CAMPAIGNS.UNIQUE_CAMPAIGN.IS_UNIQUE)
                    _redirectToUniqueMission();
                else
                    _loadCampaigns();
            }

            _init();
        }]);

})(window);
(function(global){

    global.squid.mission.controller('ChallengeController',
        ['$scope', 'mission', '$mdDialog', 'shareService',
            function($scope, mission, $mdDialog, shareService){

                $scope.mission = mission;
                $scope.isMobile = global.isIOS() || global.isAndroid();
                $scope.urlToShare = window.location.href.replaceAll('/#', '');
                $scope.textToShare = '';
                $scope.descriptionToShare = '';

                function _parseHashtagsToSpecialCharacter(){
                    $scope.mission.shareText = $scope.mission.shareText.replaceAll('#', '%23');
                }

                function _shareMission(){
                    shareService.shareMission({
                        id: $scope.mission._id
                    });
                }

                function _closeModal(){
                    $mdDialog.hide();
                }

                $scope.share = function(){
                    _shareMission();
                    _closeModal();
                };

                $scope.closeModal = function(){
                    _closeModal();
                };

                _parseHashtagsToSpecialCharacter();
            }]);

})(window);
(function (global, config) {
	"use strict";

	global.squid.mission.controller('MissionDetailsController', [
		'$scope',
		'$rootScope',
		'$routeParams',
		'participationService',
		'$mdDialog',
		'$timeout',
		'channelService',
		'$q',
		function (
			$scope,
			$rootScope,
			$routeParams,
			participationService,
			$mdDialog,
			$timeout,
			channelService,
			$q
		) {

			var firstLoad = true;
			$scope.campaign = {};
			$scope.campaignPrizes = [];
			$scope.participations = {
				data: [],
				minId: ''
			};
			$scope.isLoading = false;
			$scope.isLoadingParticipations = false;
			$scope.menuIsOpen = false;
			$scope.timeLeft = "--";
			$scope.tooltipIsOpen = false;

			function _getCampaign(campaignId) {
				return channelService.getCampaign({
					resourceId: campaignId
				}).$promise;
			}

			function _getTimeLeft(endDate) {
				var now = moment();
				var then = moment(endDate);

				var ms = moment(then, "DD/MM/YYYY HH:mm:ss").diff(moment(now, "DD/MM/YYYY HH:mm:ss"));
				var d = moment.duration(ms);
				var days = Math.floor(d.asDays());
				var hours = moment.utc(ms).format("HH");
				var minutes = moment.utc(ms).format("mm");
				var seconds = moment.utc(ms).format("ss");

				if (days < 0)
					return 'Encerrada';

				return days + " dias " + hours + " horas " + minutes + " minutos e " + seconds + " segundos.";
			}

			function _notHasNextParticipationPage() {
				return $scope.participations.data.length > 0 &&
					!$scope.participations.minId ||
					$scope.participations.data.length == 0 &&
					!firstLoad;
			}

			function _getMissionParticipations(campaignId) {
				if ($scope.isLoadingParticipations || _notHasNextParticipationPage())
					return;

				firstLoad = false;
				$scope.isLoadingParticipations = true;
				var query = {
					id: campaignId,
					minId: $scope.participations.minId,
					take: 12
				};
				if (config.ONLY_APPROVED) {
					query.status = 'approved';
				}

				participationService.getMissionParticipations(query, function (response) {
					$scope.participations.data = $scope.participations.data
						.concat(response.data)
						.distinct(function (c, n) {
							return c._id == n._id;
						});
					$scope.participations.minId = response.paginationMetadata.next ? response.paginationMetadata.next.minId : null;
					$scope.isLoadingParticipations = false;
				}, function () {
					$scope.isLoadingParticipations = false;
				});
			}

			function _initCounter() {
				setInterval(function () {
					if (!$scope.campaign || !$scope.campaign.time)
						return;
					$scope.timeLeft = _getTimeLeft($scope.campaign.time.fixedEndDate);
					$scope.$apply();
				}, 1000);
			}

			function _openParticipateDialog(ev) {
				$mdDialog.show({
					controller: 'ParticipateController',
					templateUrl: global.APP_CONFIG.APP_DIR + '/modules/mission/templates/participate.html',
					parent: angular.element(document.body),
					targetEvent: ev,
					clickOutsideToClose: true,
					locals: {
						mission: $scope.campaign
					}
				});
			}

			function _openChallengeDialog(ev) {
				$mdDialog.show({
					controller: 'ChallengeController',
					templateUrl: global.APP_CONFIG.APP_DIR + '/modules/mission/templates/challenge.html',
					parent: angular.element(document.body),
					targetEvent: ev,
					clickOutsideToClose: true,
					locals: {
						mission: $scope.campaign
					}
				});
			}

			function _showLoader() {
				$scope.isLoading = true;
			}

			function _hideLoader() {
				$scope.isLoading = false;
			}

			function _hideMenu() {
				$scope.menuIsOpen = false;
			}

			function _toggleTooltip(menuIsOpen) {
				if (menuIsOpen) {
					$timeout(function () {
						$scope.tooltipIsOpen = true;
					}, 250);
					return;
				}

				$scope.tooltipIsOpen = false;
			}

			function _populateCampaign(campaign) {
				$scope.campaign = campaign;
			}

			function _getCampaignPrizes(campaignId) {
				return channelService.getCampaignPrizes({
					resourceId: campaignId
				}).$promise;
			}

			function _populateCampaignPrizes(data) {
				$scope.campaignPrizes = data;
				$scope.allPrizesSoldOut = data.every(function (prize) {
					return !prize.hasAvailableStock;
				});
			}

			function _getCampaignAndPopulate() {
				_showLoader();
				return _getCampaign($routeParams.missionId)
					.then(_populateCampaign)
					.then(_hideLoader);
			}

			function _getCampaignPrizesAndPopulate() {
				_getCampaignPrizes($routeParams.missionId)
					.then(_populateCampaignPrizes);
			}

			function _definePageTitle() {
				$rootScope.pageTitle = '#' + $scope.campaign.hashtag;
			}

			function _init() {
				_getCampaignAndPopulate().then(_definePageTitle);
				_getCampaignPrizesAndPopulate();
				_getMissionParticipations($routeParams.missionId);
				_initCounter();
			}

			$scope.loadMoreParticipations = function () {
				_getMissionParticipations($routeParams.missionId);
			};

			$scope.participate = function (ev) {
				_hideMenu();
				_openParticipateDialog(ev);
			};

			$scope.challenge = function (ev) {
				_hideMenu();
				_openChallengeDialog(ev);
			};

			$scope.toggleMenu = function () {
				if (global.isAndroid())
					$scope.menuIsOpen = !$scope.menuIsOpen;
			};

			$scope.$watch('menuIsOpen', _toggleTooltip);

			_init();
		}
	]);


})(window, window.APP_CONFIG.CAMPAIGNS);
(function(global){

    global.squid.mission.controller('ParticipateController',
        ['$scope', 'mission', '$mdDialog',
            function($scope, mission, $mdDialog){

                $scope.mission = mission;

                $scope.isMobile = global.isIOS() || global.isAndroid();

                $scope.openInstagram = function(){

                    if(global.isIOS())
                        window.location = 'instagram://camera';
                    else
                        window.location = 'intent://instagram.com/_n/mainfeed/#Intent;package=com.instagram.android;scheme=https;end';

                    $mdDialog.hide();
                };

                $scope.closeModal = function(){
                    $mdDialog.hide();
                };

            }]);

})(window);
(function (global) {

    global.squid.mission.config(['$routeProvider', function ($routeProvider) {
        $routeProvider
            .when('/mission/actives', {
                viewUrl: global.APP_CONFIG.APP_DIR + '/modules/mission/views/actives.html',
                templateUrl: global.APP_CONFIG.VIEWS.TEMPLATES.DEFAULT(),
                pageTitle: 'Missões'
            })
            .when('/mission/mission-details/:missionId', {
                viewUrl: global.APP_CONFIG.APP_DIR +  '/modules/mission/views/mission-details.html',
                templateUrl: global.APP_CONFIG.VIEWS.TEMPLATES.DEFAULT(),
                pageTitle: '',
                secondaryNav: true
            });
    }]);

})(window);
(function (global) {
    "use strict";

    global.squid.mission.factory('participationService', ['$resource',
        function ($resource) {
            return $resource(global.APP_CONFIG.END_POINT_URL() + '/api/participation/:action/:id', {
                action: '@action',
                id: '@id'
            }, {
                getMissionParticipations: {
                    method: 'GET',
                    params: {
                        action: 'mission'
                    }
                },
                getUserParticipations: {
                    method: 'GET',
                    params: {
                        action: 'user'
                    }
                }
            });
        }
    ]);

})(window);
(function (global) {
    "use strict";

    global.squid.mission.factory('shareService', ['$resource',
        function ($resource) {
            return $resource(global.APP_CONFIG.END_POINT_URL() + '/api/share/:action/:id', {
                action: '@action',
                id: '@id'
            }, {
                shareMission: {
                    method: 'POST',
                    params: {
                        action: 'mission'
                    }
                }
            });
        }
    ]);

})(window);
(function (global) {
    "use strict";

    var toastConfig = {
        delay: 10000,
        close: 'OK'
    };

    global.squid.mission.factory('uniqueCampaignService', [
        '$rootScope', '$mdToast', '$q', '$location', 'channelService',
        function ($rootScope, $mdToast, $q, $location, channelService) {

            var _uniqueCampaign = null;

            function _getToastPosition() {
                if ($rootScope.isSmallDevice) {
                    return 'bottom left';
                } else {
                    return 'top right';
                }
            }

            function _notifyNotHaveCampaign() {
                var toast = $mdToast.simple()
                    .content('Não há campanha cadastrada no momento.')
                    .action(toastConfig.close)
                    .parent($('main').get(0))
                    .hideDelay(toastConfig.delay)
                    .highlightAction(false)
                    .position(_getToastPosition());

                $mdToast.show(toast).then(function (response) {});
            }

            function _getUniqueCampaign() {
                var defer = $q.defer();

                if(_uniqueCampaign){
                    defer.resolve(_uniqueCampaign);
                    return defer.promise;
                }

                channelService.getActiveCampaigns({}, function (campaigns) {
                    if (!campaigns)
                        return defer.reject();
                        
                    var campaign = campaigns.first();

                    if (!campaign)
                        return defer.reject();

                    _uniqueCampaign = campaign;

                    defer.resolve(campaign);
                }, defer.reject);

                return defer.promise;
            }

            function _redirectToUniqueCampaign(campaign) {
                $location.path('mission/mission-details/' + campaign._id);
            }

            function _redirectToUniqueCampaignRank(campaign){
                $location.path('campaign/rank/' + campaign._id);
            }

            return {
                getUniqueCampaign: _getUniqueCampaign,
                notifyNotHaveCampaign: _notifyNotHaveCampaign,
                redirectToUniqueCampaign: _redirectToUniqueCampaign,
                redirectToUniqueCampaignRank: _redirectToUniqueCampaignRank
            };
        }
    ]);

})(window);
(function(global){

    function WorkflowInitializer($q, $injector){

        this.initWorkflows = function(workflows){
            var defer = $q.defer();

            function _processWorkflowsInitializers(){
                var workflowInitializers = arguments;
                
                async.eachSeries(workflowInitializers, function(workflowInitializer, callback){
                    workflowInitializer.init().then(function(result){
                        callback(null);
                    }).catch(callback)
                }, function(err){
                    if(err)
                        return defer.reject(err);

                    defer.resolve();
                })
            }
            _processWorkflowsInitializers.$inject = workflows;
            $injector.invoke(_processWorkflowsInitializers); 

            return defer.promise;
        };
    }

    global.squid.workflow.factory('WorkflowInitializer', ['$q', '$injector', function($q, $injector){
        return new WorkflowInitializer($q, $injector);
    }]);

})(window);
(function (global) {

    function AboutCampaignWorkflowInitializer($q, store, $mdDialog, AboutCampaignModalService) {

        return {
            init: function () {
                var defer = $q.defer();

                if (!AboutCampaignModalService.aboutCampaignIsRead())
                    return AboutCampaignModalService.openDialog();
                
                defer.resolve();
                return defer.promise;
            }
        };
    }
    AboutCampaignWorkflowInitializer.$inject = ['$q', 'store', '$mdDialog', 'AboutCampaignModalService'];
    var _factoryInjector = AboutCampaignWorkflowInitializer.$inject.concat(AboutCampaignWorkflowInitializer);
    global.squid.workflow.factory('AboutCampaignWorkflowInitializer', _factoryInjector);

})(window);
(function (global) {

    function RedirectToStartViewWorkflowInitializer($q, $location) {

        return {
            init: function () {
                var defer = $q.defer();

                $location.path(global.APP_CONFIG.START_VIEW);
                
                defer.resolve();
                return defer.promise;
            }
        };
    }
    RedirectToStartViewWorkflowInitializer.$inject = ['$q', '$location'];
    var _factoryInjector = RedirectToStartViewWorkflowInitializer.$inject.concat(RedirectToStartViewWorkflowInitializer);
    global.squid.workflow.factory('RedirectToStartViewWorkflowInitializer', _factoryInjector);

})(window);
(function (global) {

    function RedirectToUniqueCampaignWorkflowInitializer($q, $location, uniqueCampaignService, RedirectToStartViewWorkflowInitializer) {

        function _notHaveUniqueCampaign(){
            RedirectToStartViewWorkflowInitializer.init();
            uniqueCampaignService.notifyNotHaveCampaign();
        }

        return {
            init: function () {
                return uniqueCampaignService.getUniqueCampaign()
                    .then(uniqueCampaignService.redirectToUniqueCampaign)
                    .catch(_notHaveUniqueCampaign);
            }
        };
    }
    RedirectToUniqueCampaignWorkflowInitializer.$inject = ['$q', '$location', 'uniqueCampaignService', 'RedirectToStartViewWorkflowInitializer'];
    var _factoryInjector = RedirectToUniqueCampaignWorkflowInitializer.$inject.concat(RedirectToUniqueCampaignWorkflowInitializer);
    global.squid.workflow.factory('RedirectToUniqueCampaignWorkflowInitializer', _factoryInjector);

})(window);
(function (global) {

    var _campaignControllers = global.squid.campaign.controllers;

    function TermsOfUseWorkflowInitializer($q, $mdDialog, TermsOfUseValidator) {
        return {
            init: function () {
                var defer = $q.defer();

                TermsOfUseValidator
                    .init()
                    .then(defer.resolve)
                    .catch(function () {
                        $mdDialog.show({
                            controller: _campaignControllers.TermsOfUseDialogController,
                            templateUrl: global.APP_CONFIG.APP_DIR + '/modules/campaign/views/terms-of-use-dialog.html',
                            parent: angular.element(document.body),
                            clickOutsideToClose: false,
                            escapeToClose: false
                        }).then(defer.resolve, defer.reject);
                    });

                return defer.promise;
            }
        };
    }
    TermsOfUseWorkflowInitializer.$inject = ['$q', '$mdDialog', 'TermsOfUseValidator'];
    global.squid.workflow.factory('TermsOfUseWorkflowInitializer', TermsOfUseWorkflowInitializer);

})(window);
(function (global) {

    var _userControllers = global.squid.user.controllers;

    function UserMetadataWorkflowInitializer($q, store, $mdDialog, userMetadataHelper) {

        function _requiredUserInfosFilled() {
            var userMetadata = userMetadataHelper.getUserMetadata();

            if (!userMetadata)
                return false;

            return global.APP_CONFIG.USER_METADATA.REQUIRED_INFOS.all(function (requiredInfo) {
                return !!userMetadata[requiredInfo];
            });
        }

        return {
            init: function () {
                var defer = $q.defer();

                if (_requiredUserInfosFilled()) {
                    defer.resolve();
                } else {
                    $mdDialog.show({
                        controller: _userControllers.UserMetadataDialogController,
                        templateUrl: global.APP_CONFIG.APP_DIR + '/modules/user/views/user-metadata-dialog.html',
                        parent: angular.element(document.body),
                        clickOutsideToClose: false,
                        escapeToClose: false
                    }).then(defer.resolve, defer.reject);
                }

                return defer.promise;
            }
        };
    }
    UserMetadataWorkflowInitializer.$inject = ['$q', 'store', '$mdDialog', 'userMetadataHelper'];
    var _factoryInjector = UserMetadataWorkflowInitializer.$inject.concat(UserMetadataWorkflowInitializer);
    global.squid.workflow.factory('UserMetadataWorkflowInitializer', _factoryInjector);

})(window);
(function (global) {

    function TermsOfUseValidator($q, store, userMetadataHelper) {

        return {
            init: function () {
                var defer = $q.defer();

                userMetadataHelper.termsIsAccepted() 
                    ? defer.resolve()
                    : defer.reject();

                return defer.promise;
            }
        };
    }
    TermsOfUseValidator.$inject = ['$q', 'store', 'userMetadataHelper'];
    var _factoryInjector = TermsOfUseValidator.$inject.concat(TermsOfUseValidator);
    global.squid.workflow.factory('TermsOfUseValidator', _factoryInjector);

})(window);
(function (global) {
    "use strict";

    var toastConfig = {
        delay: 10000,
        close: 'OK'
    };

    global.squid.user.controller('MyProfileController', [
        '$scope',
        '$rootScope',
        'auth',
        'userService',
        '$location',
        'participationService',
        '$mdToast',
        function (
            $scope,
            $rootScope,
            auth,
            userService,
            $location,
            participationService,
            $mdToast
        ) {

            var firstLoad = true;
            $scope.isSaving = false;
            $scope.isLoadingParticipations = false;
            $scope.auth = auth;
            $scope.userMetadata = {};
            $scope.selectedTabIndex = 0;
            $scope.isLoading = false;
            $scope.participations = {
                data: [],
                minId: ''
            };

            function _getToastPosition() {
                if ($rootScope.isSmallDevice) {
                    return 'bottom left';
                } else {
                    return 'top right';
                }
            }

            function _getUserStatistics() {
                userStatisticsService.getUserProfileStatistics(function (userStatistics) {
                    $scope.userStatistics = userStatistics;
                });
            }

            function _canNotLoadParticipations() {
                return $scope.isLoadingParticipations ||
                    $scope.participations.data.length > 0 && !$scope.participations.minId ||
                    $scope.participations.data.length == 0 && !firstLoad;
            }

            function _onUserMetadataSaved(userMetadata) {
                var toast = $mdToast.simple()
                    .content('Dados salvos :)')
                    .action(toastConfig.close)
                    .parent($('main').get(0))
                    .hideDelay(toastConfig.delay)
                    .highlightAction(false)
                    .position(_getToastPosition());

                $mdToast.show(toast).then(function (response) {});
            }

            function _getUserParticipation() {
                if (_canNotLoadParticipations())
                    return;

                firstLoad = false;
                $scope.isLoadingParticipations = true;

                participationService.getUserParticipations({
                    id: auth.profile.user_id,
                    minId: $scope.participations.minId,
                    take: 12
                }, function (response) {
                    $scope.participations.data = $scope.participations.data
                        .concat(response.data)
                        .distinct(function (c, n) {
                            return c._id == n._id;
                        });
                    $scope.participations.minId = response.paginationMetadata.next ? response.paginationMetadata.next.minId : null;
                    $scope.isLoadingParticipations = false;
                }, function () {
                    $scope.isLoadingParticipations = false;
                });
            }

            function _init() {
                if (!auth.isAuthenticated)
                    return;

                _getUserParticipation();
            }

            $scope.loadMoreParticipations = function () {
                if (!auth.isAuthenticated)
                    return;

                _getUserParticipation();
            };

            $scope.save = function () {
                $scope.saveUserMetadata()
                    .then(_onUserMetadataSaved);
            };

            $scope.saveUserMetadata = function () {}; // user-metadata-directive will override this method!

            $scope.getSaveButtonLabel = function () {
                return $scope.isSaving ? 'Salvando...' : 'Salvar';
            };

            _init();
        }
    ]);


})(window);
(function (global) {

    var toastConfig = {
        delay: 10000,
        close: 'OK'
    };

    function UserMetadataDialogController($scope, $rootScope, $mdDialog, $mdToast, squidSpidermanService, userMetadataHelper) {

        var EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
        $scope.isLoading = false;
        $scope.userMetadata = userMetadataHelper.getUserMetadata() || {};

        function _getToastPosition() {
            if ($rootScope.isSmallDevice) {
                return 'bottom left';
            } else {
                return 'top right';
            }
        }

        function _isValidEmail(email) {
            return EMAIL_REGEX.test(email);
        }

        function _metadataUpdated() {
            $scope.isLoading = false;
            $mdDialog.hide();
        }

        function _metadataNotUpdated() {
            $scope.isLoading = false;
            var toast = $mdToast.simple()
                .content('Não foi possível salvar os dados, contate o administrador.')
                .action(toastConfig.close)
                .parent($('main').get(0))
                .hideDelay(toastConfig.delay)
                .highlightAction(false)
                .position(_getToastPosition());

            $mdToast.show(toast);
        }

        function _invalidEmail() {
            var toast = $mdToast.simple()
                .content('Insira um e-mail válido.')
                .action(toastConfig.close)
                .parent($('main').get(0))
                .hideDelay(toastConfig.delay)
                .highlightAction(false)
                .position(_getToastPosition());

            $mdToast.show(toast);
        }

        $scope.save = function (userMetadata) {
            if (!_isValidEmail(userMetadata.email))
                return _invalidEmail();

            $scope.isLoading = true;
            squidSpidermanService
                .updateUserMetadata(userMetadata, _metadataUpdated, _metadataNotUpdated);
        };

    }

    global.squid.user.controllers.UserMetadataDialogController = UserMetadataDialogController;
    global.squid.user.controller('UserMetadataDialogController', [
        '$scope',
        '$rootScope',
        '$mdDialog',
        '$mdToast',
        'squidSpidermanService',
        'userMetadataHelper',
        UserMetadataDialogController
    ]);

})(window);
(function (global) {
    "use strict";

    global.squid.user.factory('userMetadataHelper', ['store', function (store) {

        function _getProfile() {
            return store.get('profile');
        }

        function _termsIsAccepted() {
            var userMetadata = _getUserMetadata();
            return !userMetadata ? false : userMetadata.acceptedTerms;
        }

        function _getUserMetadata() {
            var userProfile = _getProfile();

            if (!userProfile || !userProfile.user_metadata || !userProfile.user_metadata.infos)
                return null;

            return userProfile.user_metadata.infos.first(function (userMetadata) {
                return userMetadata.channelId == global.APP_CONFIG.APP_ID();
            });
        }

        return {
            getProfile: _getProfile,
            getUserMetadata: _getUserMetadata,
            termsIsAccepted: _termsIsAccepted
        };
    }]);

})(window);
(function (global) {

    global.squid.user.config(['$routeProvider', function ($routeProvider) {
        $routeProvider
            .when('/my-profile', {
                viewUrl: global.APP_CONFIG.APP_DIR + '/modules/user/views/my-profile.html',
                templateUrl: global.APP_CONFIG.VIEWS.TEMPLATES.DEFAULT(),
                pageTitle: 'Meu Perfil'
            });
    }]);

})(window);
(function (global) {
    "use strict";

    global.squid.user.factory('squidSpidermanService', ['$resource',
        function ($resource) {
            return $resource(global.APP_CONFIG.SPIDERMAN_END_POINT_URL() + '/:action', {
                action: '@action'
            }, {
                updateUserMetadata: {
                    method: 'PATCH',
                    params:{
                        action: 'usermetadata'
                    }
                },
                getUserMetadata: {
                    method: 'GET',
                    params:{
                        action: 'usermetadata'
                    }
                }
            });
        }
    ]);

})(window);
(function (global) {
    "use strict";

    global.squid.user.factory('userService', ['$resource',
        function ($resource) {
            return $resource(global.APP_CONFIG.END_POINT_URL() + '/api/user/:action/:id', {
                action: '@action',
                id: '@id'
            }, {
                email: {
                    method: 'PUT',
                    params:{
                        action: 'email'
                    }
                },
                update: {
                    method: 'PUT'
                }
            });
        }
    ]);

})(window);
(function (global) {
    "use strict";

    global.squid.user.factory('userStatisticsService', ['$resource',
        function ($resource) {
            return $resource(global.APP_CONFIG.END_POINT_URL() + '/api/statistics/user/:action/:id', {
                action: '@action',
                id: '@id'
            }, {
                getUserProfileStatistics: {
                    method: 'GET',
                    params:{
                        action: 'me'
                    }
                }
            });
        }
    ]);

})(window);
(function (global) {
    "use strict";

    global.squid.checkout.directive('checkoutHistory', ['checkoutService', function (checkoutService) {
        return {
            templateUrl: global.APP_CONFIG.APP_DIR + '/modules/checkout/directives/checkout-history/checkout-history.html',
            link: function ($scope, $element, $attrs, $ctrl) {

                $scope.isLoading = false;
                $scope.checkoutHistoryList = [];

                function _populateCheckoutHistory(history) {
                    $scope.checkoutHistoryList = history;
                }

                function _getUserCheckoutHistory() {
                    return checkoutService.getUserCheckouts().$promise;
                }

                function _init() {
                    _getUserCheckoutHistory()
                        .then(_populateCheckoutHistory)
                }

                _init();
            }
        }
    }]);

})(window);
(function (global) {
    "use strict";

    global.squid.checkout.controller('CheckoutRescueModalController',
        ['$scope', '$modalInstance', 'prize', 'auth', 'checkoutService', 'userService',
            function ($scope, $modalInstance, prize, auth, checkoutService, userService) {
                $scope.prize = prize;
                $scope.email = auth.profile.email;
                $scope.validateStatus = 'carregando...';

                var prizeValidate = false;
                var msgPreencherEmail = false;


                $scope.rescue = function () {
                    _rescue();
                };

                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };


                function _rescue() {
                    if ($scope.email != auth.profile.email) {
                        userService.email({
                            email: $scope.email
                        }, function (result) {
                            _getPrize();
                        }, function (err) {
                            $scope.validateStatus = err.data.message;
                        });
                    } else {
                        _getPrize();
                    }

                }

                function _getPrize() {
                    checkoutService.getPrize({
                        id: prize.id
                    }, function (result) {
                        $scope.validateStatus = result.message;

                    }, function (err) {
                        $scope.validateStatus = err.data.message;

                        if (err.data.message.contains('e-mail')) {
                            msgPreencherEmail = true;
                        }
                    });
                }


                function _validatePrize() {
                    checkoutService.validate({
                        id: prize.id
                    }, function (result) {
                        $scope.validateStatus = result.status;
                        if (result.status.contains('ok'))
                            prizeValidate = true;
                    }, function (err) {
                        $scope.validateStatus = err.data.message;
                    });
                };

                function _init() {
                    _validatePrize();
                }

                _init();
            }
        ]);

}(window));
(function (global) {
    "use strict";

    global.squid.checkout.directive('checkoutRescue', ['channelService', function (channelService) {
        return {
            templateUrl: global.APP_CONFIG.APP_DIR + '/modules/checkout/directives/checkout-rescue/checkout-rescue.html',
            link: function ($scope, $element, $attrs, $ctrl) {

                $scope.checkoutList = [];
                $scope.isLoading = false;

                function _prizeWithoutAvailableStockExpression(prize){
                    return !prize.hasAvailableStock;
                }

                function _formatCampaignPrizes(point) {
                    return function (prizes) {
                        return Object.assign({}, point, {
                            prizes: prizes,
                            allPrizesSoldOut: prizes.every(_prizeWithoutAvailableStockExpression),
                        });
                    }
                }

                function _parseCheckoutList(points) {
                    return Promise.all(points.map(function (point) {
                        return channelService.getCampaignPrizes({
                                resourceId: point.campaign.id
                            })
                            .$promise
                            .then(_formatCampaignPrizes(point));
                    }));
                }

                function _populateCheckoutList(checkoutList) {
                    $scope.checkoutList = checkoutList;
                }

                function _getCheckouts(minId) {
                    $scope.isLoading = true;
                    channelService.getSelfPoints().$promise
                        .then(_parseCheckoutList)
                        .then(_populateCheckoutList)
                        .then(_hideLoader)
                        .catch(_hideLoader);;
                }

                function _showLoader() {
                    $scope.isLoading = true;
                }

                function _hideLoader() {
                    $scope.isLoading = false;
                }

                $scope.hasPointsAvailable = function (checkout, prize) {
                    return checkout.totalAvaible >= prize.points;
                };

                _getCheckouts();
            }
        }
    }]);

})(window);
(function (global) {
    "use strict";

    var toastConfig = {
        delay: 10000,
        close: 'OK'
    };

    global.squid.user.directive('userMetadataForm', [
        'addressService',
        '$q',
        '$rootScope',
        '$mdToast',
        'syncPromise',
        'squidSpidermanService',
        function (
            addressService,
            $q,
            $rootScope,
            $mdToast,
            syncPromise,
            squidSpidermanService
        ) {
            return {
                scope: {
                    ngModel: '=',
                    isSaving: '=',
                    save: '='
                },
                templateUrl: global.APP_CONFIG.APP_DIR + '/modules/user/directives/user-metadata-form/user-metadata-form.html',
                link: function ($scope, $element, $attrs, $controller) {

                    $scope.isLoading = false;
                    $scope.states = [
                        'AC', 'AL', 'AP', 'AM',
                        'BA', 'CE', 'DF', 'ES',
                        'GO', 'MA', 'MT', 'MS',
                        'MG', 'PA', 'PB', 'PR',
                        'PE', 'PI', 'RJ', 'RN',
                        'RS', 'RO', 'RR', 'SC',
                        'SP', 'SE', 'TO'
                    ];

                    function _getToastPosition() {
                        if ($rootScope.isSmallDevice) {
                            return 'bottom left';
                        } else {
                            return 'top right';
                        }
                    }

                    function _getAddressByCep(cep) {
                        var defer = $q.defer();

                        if (!cep) {
                            defer.reject();
                            return defer.promise;
                        }

                        addressService.get({
                            cep: cep
                        }, defer.resolve, defer.reject);

                        return defer.promise;
                    }

                    function _getAddress(addressMetadata) {
                        return !!addressMetadata.logradouro ?
                            addressMetadata.logradouro + ', ' + addressMetadata.complemento + ', ' + addressMetadata.bairro :
                            '';
                    }

                    function _populateCep(addressMetadata) {
                        $scope.ngModel.state = addressMetadata.uf;
                        $scope.ngModel.city = addressMetadata.localidade;
                        $scope.ngModel.address = _getAddress(addressMetadata);
                    }

                    function _getUserMetadata() {
                        var defer = $q.defer();
                        squidSpidermanService.getUserMetadata(defer.resolve, defer.reject);
                        return defer.promise;
                    }

                    function _populateUserMetadata(userMetadata) {
                        delete userMetadata.$promise;
                        delete userMetadata.$resolved;
                        userMetadata.birthday = moment(userMetadata.birthday)._d;
                        $scope.ngModel = userMetadata;
                    }

                    function _updateUserMetadata(metadata) {
                        var defer = $q.defer();
                        squidSpidermanService.updateUserMetadata(metadata, defer.resolve, defer.reject);
                        return defer.promise;
                    }

                    function _showLoader() {
                        $scope.isLoading = true;
                    }

                    function _hideLoader() {
                        $scope.isLoading = false;
                    }

                    function _showMessage(message) {
                        var toast = $mdToast.simple()
                            .content(message)
                            .action(toastConfig.close)
                            .parent($('main').get(0))
                            .hideDelay(toastConfig.delay)
                            .highlightAction(false)
                            .position(_getToastPosition());

                        $mdToast.show(toast).then(function (response) {});
                    }

                    function _validateUserMetadata(userMetadata) {
                        var hasAnyUnfilledRequiredField = global.APP_CONFIG.CHECKOUT.REQUIRED_INFOS.any(function (field) {
                            return !userMetadata[field];
                        });

                        if (hasAnyUnfilledRequiredField)
                            _showMessage('Preencha os campos obrigatórios.');

                        return !hasAnyUnfilledRequiredField;
                    }

                    function _interUserMetadataSaved(result){
                        $scope.isSaving = false;
                        return result;
                    }

                    function _interUserMetadataNotSaved(defer){
                        return function(error){
                            $scope.isSaving = false;
                            defer.reject(error);
                        }
                    }

                    function _init() {
                        _showLoader();
                        _getUserMetadata()
                            .then(syncPromise(_populateUserMetadata))
                            .then(_hideLoader);
                    }

                    $scope.save = function () {
                        var defer = $q.defer();

                        if (!_validateUserMetadata($scope.ngModel)) {
                            defer.reject();
                            return defer.promise;
                        }

                        _showLoader();
                        $scope.isSaving = true;
                        _updateUserMetadata($scope.ngModel)
                            .then(syncPromise(_hideLoader))
                            .then(syncPromise(_interUserMetadataSaved))
                            .then(defer.resolve)
                            .catch(_interUserMetadataNotSaved(defer));

                        return defer.promise;
                    };

                    $scope.tryGetCep = function (cep) {
                        if (cep.length < 8)
                            return;

                        _getAddressByCep(cep)
                            .then(syncPromise(_populateCep));
                    };

                    _init();
                }
            };
        }
    ]);


})(window);