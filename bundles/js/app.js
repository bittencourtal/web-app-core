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
        'squid-login',
        'squid-feed',
        'squid-mission',
        'squid-checkout',
        'squid-user'
    ];

    global.squid.app = angular.module("squid-app", global.squid.defaultDependencies.concat(_modulesDependencies));

    global.squid.app.run(
        ['$rootScope', 'auth', 'store', 'jwtHelper', '$location',
            function ($rootScope, auth, store, jwtHelper, $location) {
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
                    if (!_userAcceptedTerms())
                        _logout();

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

    global.squid.app.directive('toolbar',
        ['$mdSidenav', '$location', 'auth', 'store', '$mdMedia', 'AboutCampaignModalService',
            function($mdSidenav, $location, auth, store, $mdMedia, AboutCampaignModalService){
                return {
                    templateUrl: global.APP_CONFIG.APP_DIR + '/directives/toolbar/toolbar.html',
                    restrict: 'EA',
                    replace: true,
                    scope: {},
                    link: function($scope, $element, $attrs, $controllers){

                        $scope.APP_CONFIG = global.APP_CONFIG;
                        $scope.$mdSidenav = $mdSidenav;
                        $scope.path = $location.$$path.split("/")[1];
                        $scope.auth = auth;
                        $scope.$location = $location;
                        $scope.isSmallDevice = $mdMedia('sm');
                        $scope.mobileSideMenuUrl = global.APP_CONFIG.APP_DIR + '/directives/toolbar/mobile-side-menu.html';

                        function _logout() {
                            auth.signout();
                            store.remove('profile');
                            store.remove('token');
                            $.jStorage.flush();
                            _redirectToLogin();
                        }

                        function _redirectToLogin(){
                          $location.path(global.LOGIN_ROUTE);
                        }

                        function _redirectToStartView(){
                          $location.path(global.START_VIEW);
                        }

                        $scope.getButtonClass = function (menu) {
                            return {
                                'active': $scope.path == menu
                            };
                        };

                        $scope.goBack = function(){
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

                        $scope.openAboutCampaign = function(){
                            AboutCampaignModalService.openDialog(auth.profile)
                                .then(function(){}, _logout);
                        };

                        $scope.logout = function () {
                            auth.signout();
                            store.remove('profile');
                            store.remove('token');
                            $.jStorage.flush();

                            if(global.APP_CONFIG.REQUIRE_AUTHENTICATION){
                              _redirectToLogin();
                            }else{
                              _redirectToStartView();
                            }
                        };

                    }
                }
            }]);

})(window);

(function(global){

    global.squid.app.factory('appIdInjector', [function() {
        var appIdInjector = {
            request: function(config) {
                config.headers['app_id'] = global.APP_CONFIG.APP_ID();
                return config;
            }
        };

        return appIdInjector;
    }]);

})(window);
(function(global) {

    global.squid.app.config(['$routeProvider', function($routeProvider) {
        $routeProvider
            .otherwise({
                redirectTo: '/mission/actives'
            });
    }]);

})(window);

(function(global) {

	global.squid.checkout = angular.module("squid-checkout", []);

})(window);
(function(global) {

	global.squid.feed = angular.module("squid-feed", []);

})(window);
(function(global) {

	global.squid.login = angular.module("squid-login", []);

})(window);
(function(global) {

	global.squid.mission = angular.module("squid-mission", []);

})(window);
(function(global) {

	global.squid.user = angular.module("squid-user", []);

})(window);
(function (global) {

    var toastConfig = {
        delay: 10000,
        close: 'OK'
    };

    function AboutCampaignController($scope, $mdDialog, AboutCampaignModalService) {

        $scope.currentStep = 'step-1';
        $scope.TEXTS = {
            STEP1: APP_CONFIG.ABOUT_CAMPAIGN.TEXTS.STEP_1,
            STEP2: APP_CONFIG.ABOUT_CAMPAIGN.TEXTS.STEP_2
        };

        $scope.next = function () {
            $scope.currentStep = 'step-2';
        };

        $scope.back = function () {
            $scope.currentStep = 'step-1';
        };

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        $scope.ok = function () {
            $mdDialog.hide(true);
        }
    }

    global.squid.login.controller('AboutCampaignController', ['$scope', '$mdDialog', AboutCampaignController]);

    global.squid.login.factory('AboutCampaignModalService',
        ['$rootScope', '$q', '$mdDialog', '$mdToast', 'userService', 'store',
            function ($rootScope, $q, $mdDialog, $mdToast, userService, store) {

                function _getToastPosition() {
                    if ($rootScope.isSmallDevice) {
                        return 'bottom left';
                    } else {
                        return 'top right';
                    }
                }

                function _updateUserMetadata(profile) {
                    var defer = $q.defer();

                    userService.update(profile.app_metadata, function (response) {
                        defer.resolve(profile);
                    }, function (err) {
                        defer.reject(profile);
                    });

                    return defer.promise;
                }

                function _aboutCampaignNotRead(profile) {
                    var defer = $q.defer();

                    profile.app_metadata = (!!profile.app_metadata) ? profile.app_metadata : {};
                    profile.app_metadata.acceptedTerms = false;
                    store.set('profile', profile);

                    var toast = $mdToast.simple()
                        .content('Confirme a leitura sobre a campanha para poder navegar e participar.')
                        .action(toastConfig.close)
                        .parent($('main').get(0))
                        .hideDelay(toastConfig.delay)
                        .highlightAction(false)
                        .position(_getToastPosition());

                    $mdToast.show(toast).then(function (response) { });

                    _updateUserMetadata(profile)
                        .then(defer.resolve, defer.reject);

                    return defer.promise;
                }

                function _aboutCampaignRead(acceptTerms, profile) {
                    var defer = $q.defer();

                    profile.app_metadata = (!!profile.app_metadata) ? profile.app_metadata : {};
                    profile.app_metadata.acceptedTerms = acceptTerms;
                    store.set('profile', profile);

                    _updateUserMetadata(profile)
                        .then(defer.resolve, defer.reject);

                    return defer.promise;
                }

                function _openDialog(profile) {
                    var defer = $q.defer();

                    $mdDialog.show({
                        controller: AboutCampaignController,
                        templateUrl: global.APP_CONFIG.APP_DIR + '/modules/campaign/views/about-campaign-dialog.html',
                        parent: angular.element(document.body),
                        clickOutsideToClose: true
                    }).then(function (aboutCampaignRead) {
                        _aboutCampaignRead(aboutCampaignRead, profile)
                            .then(defer.resolve, defer.reject);
                    }, function () {
                        _aboutCampaignNotRead(profile)
                            .then(defer.reject, defer.reject);
                    });

                    return defer.promise;
                }

                return {
                    openDialog: _openDialog
                }
            }]);

})(window);
(function (global) {
    "use strict";

    global.squid.checkout.controller('CheckoutController', [
        '$scope', 'checkoutService',
        function ($scope, checkoutService) {

            $scope.checkoutList = [];
            $scope.paginationMetadata = {};
            $scope.isLoading = false;

            function _getCheckouts(minId) {
                var query = {};

                if(minId)
                    query.minId = minId;

                $scope.isLoading = true;

                checkoutService.getCheckouts(query, function (result) {
                    $scope.checkoutList = $scope.checkoutList.concat(result.data);
                    $scope.paginationMetadata = result.paginationMetadata;
                    $scope.isLoading = false;
                }, function (err) {
                    $scope.isLoading = false;
                });
            }

            $scope.loadMore = function () {
                if ($scope.isLoading || !$scope.paginationMetadata.next)
                    return;

                _getCheckouts($scope.paginationMetadata.next.minId);
            };

            $scope.hasPointsAvailable = function (checkout, prize) {
                return checkout.pointsAvailable >= prize.points;
            };

            _getCheckouts();

        }]);

})(window);
(function (global) {
    "use strict";

    var toastConfig = {
        delay: 30000,
        close: 'OK'
    };

    global.squid.checkout.controller('CheckoutPrizeController', [
        '$scope', '$rootScope', 'checkoutService', 'userService', 'prizeService', '$mdToast', '$mdDialog', '$routeParams', 'auth', '$location',
        function ($scope, $rootScope, checkoutService, userService, prizeService, $mdToast, $mdDialog, $routeParams, auth, $location) {

            $scope.auth = auth;
            $scope.userMetadata = {};
            $scope.isLoading = false;
            $scope.currentTabIndex = 0;
            $scope.maxYear = moment().subtract(5, 'year').year();
            $scope.prize = {};

            function _bindProfileData(){
                var _profileBirthDate = moment(auth.profile.birthDate);

                $scope.birthDate = {
                    day: auth.profile.birthDate ? _profileBirthDate.date() : '',
                    month: auth.profile.birthDate ? _profileBirthDate.month() + 1 : '',
                    year: auth.profile.birthDate ? _profileBirthDate.year() : ''
                };

                $scope.userMetadata.emailContact = auth.profile.emailContact;
                $scope.userMetadata.phone = auth.profile.phone;
                $scope.userMetadata.address = auth.profile.address;
                $scope.userMetadata.birthDate = auth.profile.birthDate;
                $scope.userMetadata.gender = auth.profile.gender;
            }

            function _getPrize() {
                var deferred = new $.Deferred();

                prizeService.get({
                    id: $routeParams.prizeId
                }, function (prize) {
                    $scope.prize = prize;
                    deferred.resolve(prize);
                }, function (err) {
                    deferred.reject(err);
                });

                return deferred.promise();
            }

            function _bindBirthDate(){
                $scope.userMetadata.birthDate = moment({
                    day: $scope.birthDate.day,
                    month: ($scope.birthDate.month - 1),
                    year: $scope.birthDate.year
                });
            }

            function _updateUserMetadata(){
                var deferred = new $.Deferred();

                _bindBirthDate();

                userService.update($scope.userMetadata, function(result){
                    deferred.resolve(result);
                }, function(err){
                    deferred.reject(err);
                });

                return deferred.promise();
            }

            function _checkoutPrize(){
                var deferred = new $.Deferred();

                checkoutService.checkoutPrize({
                    id: $routeParams.prizeId
                }, function(result){
                    deferred.resolve(result);
                }, function(err){
                    deferred.reject(err);
                });

                return deferred.promise();
            }

            function _getToastPosition(){
                if($rootScope.isSmallDevice){
                    return 'bottom left';
                }else{
                    return 'top right';
                }
            }

            function _successCheckout(result){
                var toast = $mdToast.simple()
                    .content(result.message)
                    .action(toastConfig.close)
                    .parent($('main').get(0))
                    .hideDelay(toastConfig.delay)
                    .highlightAction(false)
                    .position(_getToastPosition());

                $mdToast.show(toast).then(function(response) {});

                $scope.isLoading = false;
                $location.path('checkout');
            }

            function _failCheckout(err){
                var data = err.data;

                var toast = $mdToast.simple()
                    .content(data.message)
                    .action(toastConfig.close)
                    .parent($('main').get(0))
                    .hideDelay(toastConfig.delay)
                    .highlightAction(false)
                    .position(_getToastPosition());

                $mdToast.show(toast).then(function(response) {});

                $scope.isLoading = false;
            }

            function _failUpdateProfileInfo(){

                var toast = $mdToast.simple()
                    .content('Não foi possível atualizar as informações de perfil.')
                    .action(toastConfig.close)
                    .parent($('main').get(0))
                    .hideDelay(toastConfig.delay)
                    .highlightAction(false)
                    .position(_getToastPosition());

                $mdToast.show(toast).then(function(response) {});

                $scope.isLoading = false;
            }

            function _init(){
                $scope.isLoading = true;

                _getPrize().then(function(){
                    $scope.isLoading = false;
                });
            }

            $scope.onTabSelected = function(tabIndex){
                $scope.currentTabIndex = tabIndex;
            };

            $scope.currentStepIsValid = function(){
                if(!$scope.userProfile || !$scope.userProfile.emailContact)
                    return false;

                switch($scope.currentTabIndex){
                    case 0:
                        return $scope.userProfile.emailContact.$valid && $scope.userProfile.phone.$valid;

                    case 1:
                        return $scope.userProfile.address.$valid;

                    case 2:
                        return $scope.userProfile.birthDateDay.$valid && $scope.userProfile.birthDateMonth.$valid && $scope.userProfile.birthDateYear.$valid;

                    case 3:
                        return $scope.userProfile.gender.$valid;
                }
            };

            $scope.nextStep = function(){
              $scope.currentTabIndex++;
            };

            $scope.rescue = function(){
                $scope.isLoading = true;

                _updateUserMetadata().then(function(result){
                    _checkoutPrize().then(_successCheckout, _failCheckout);
                }, _failUpdateProfileInfo);
            };

            _init();

            $scope.$watch('auth.profile', function(){
                _bindProfileData();
            });
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
            .when('/checkout/:prizeId', {
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

    global.squid.checkout.factory('checkoutService', ['$resource',
        function ($resource) {
            return $resource(global.APP_CONFIG.END_POINT_URL() + '/api/checkout/:action/:id', {
                action: '@action',
                id: '@id'
            }, {
                getCheckouts: {
                    method: 'GET',
                    params:{
                        action: 'missions'
                    }
                },
                getVouchersByUser: {
                    method: 'GET',
                    params:{
                        action: 'vouchers'
                    },
                    isArray: true
                },
                validate: {
                    method: 'GET',
                    params:{
                        action: 'validate'
                    }
                },
                checkoutPrize: {
                    method: 'POST',
                    params:{
                        action: 'prize'
                    }
                }
            });
        }
    ]);

})(window);
(function (global) {
    "use strict";

    global.squid.checkout.factory('prizeService', ['$resource',
        function ($resource) {
            return $resource(global.APP_CONFIG.END_POINT_URL() + '/api/prize/:action/:id', {
                action: '@action',
                id: '@id'
            }, {
                get: {
                    method: 'GET'
                }
            });
        }
    ]);

})(window);
(function (global) {
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
                var query = {};

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

})(window);

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

    global.squid.login.controller('LoginController', [
        '$scope', '$rootScope', 'auth', '$location', 'store', '$mdDialog', '$mdToast', '$q', 'userService', 'AboutCampaignModalService',
        function ($scope, $rootScope, auth, $location, store, $mdDialog, $mdToast, $q, userService, AboutCampaignModalService) {

            $scope.isLoading = false;

            var dict = {
                loadingTitle: 'carregando...',
                close: 'fechar',
                signin: {
                    title: 'Faça seu login ;)',
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

            function _termsIsAccepted(profile){
                if(!profile || !profile.app_metadata)
                    return false;

                return profile.app_metadata.acceptedTerms;
            }

            function _logout() {
                auth.signout();
                store.remove('profile');
                store.remove('token');
                $.jStorage.flush();
                _hideLoader();
                _redirectToLogin();
            }

            function _redirectToLogin(){
                $location.path(global.APP_CONFIG.LOGIN_ROUTE);
            }

            function _redirectToStartView(){
                $location.path(global.APP_CONFIG.START_VIEW);
            }

            function _redirectOnSuccessLogin(profile){
                if (_containsAllData(profile))
                    _redirectToStartView();
                else
                    $location.path('/register');
            }

            function _redirectIfIsLoggedIn() {
                if (auth.isAuthenticated)
                    $location.path(global.APP_CONFIG.START_VIEW);
            }

            function _containsAllData(profile) {
                if(!profile)
                    return;

                return profile.birthDate && profile.gender;
            }

            function _hideLoader(){
                var defer = $q.defer();

                $scope.isLoading = false;
                defer.resolve();

                return defer.promise;
            }

            function _showLoader(){
                var defer = $q.defer();

                $scope.isLoading = true;
                defer.resolve();

                return defer.promise;
            }

            function _initAuthLockComponent() {
                auth.config.auth0lib.$container = null;
                auth.signin({
                    connections: ['instagram'],
                    container: 'login-box',
                    icon: '../images/logo.png',
                    dict: dict
                }, function (profile, token) {
                    store.set('profile', profile);
                    store.set('token', token);

                    if(_termsIsAccepted(profile))
                        return _redirectOnSuccessLogin(profile);

                    _showLoader();

                    AboutCampaignModalService.openDialog(profile)
                        .then(_redirectOnSuccessLogin, _logout);
                }, function (error) {

                });
            }

            _redirectIfIsLoggedIn();
            _initAuthLockComponent();

        }

    ])
    ;

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
    global.squid.mission.controller('ActiveMissionController', ['$scope', 'feedService', '$location',
        function ($scope, feedService, $location) {
            
        }
    ]);
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
(function (global) {
    "use strict";

    global.squid.mission.controller('MissionDetailsController', [
        '$scope', '$rootScope', '$routeParams','missionService', 'participationService', '$mdDialog', '$timeout',
        function ($scope, $rootScope, $routeParams, missionService, participationService, $mdDialog, $timeout) {

            var firstLoad = true;
            $scope.mission = {};
            $scope.participations = {
                data: [],
                minId: ''
            };
            $scope.isLoading = false;
            $scope.isLoadingParticipations = false;
            $scope.menuIsOpen = false;
            $scope.timeLeft = "--";
            $scope.tooltipIsOpen = false;

            function _getMission(){
                var deferred = new $.Deferred();

                $scope.isLoading = true;

                missionService.getMissionById({
                    id: $routeParams.missionId
                }, function (result) {
                    $scope.mission = result;
                    $scope.isLoading = false;
                    deferred.resolve();
                }, function (err) {
                    $scope.isLoading = false;
                    deferred.reject();
                });

                return deferred.promise();
            }

            function _getTimeLeft(endDate){
                var now  = moment();
                var then = moment(endDate);

                var ms = moment(then,"DD/MM/YYYY HH:mm:ss").diff(moment(now,"DD/MM/YYYY HH:mm:ss"));
                var d = moment.duration(ms);
                var days = Math.floor(d.asDays());
                var hours = moment.utc(ms).format("HH");
                var minutes = moment.utc(ms).format("mm");
                var seconds = moment.utc(ms).format("ss");

                if(days <= 0)
                    return 'Encerrada';

                return days + " dias " + hours + " horas " + minutes + " minutos e " + seconds + " segundos.";
            }

            function _getMissionParticipations(){
                if($scope.isLoadingParticipations
                    || $scope.participations.data.length > 0 && !$scope.participations.minId
                    || $scope.participations.data.length == 0 && !firstLoad
                )
                    return;

                firstLoad = false;
                $scope.isLoadingParticipations = true;

                participationService.getMissionParticipations({
                    id: $scope.mission._id,
                    minId: $scope.participations.minId,
                    take: 12
                }, function(response){
                    $scope.participations.data = $scope.participations.data
                        .concat(response.data)
                        .distinct(function(c, n){
                            return c._id == n._id;
                        });
                    $scope.participations.minId = response.paginationMetadata.next ? response.paginationMetadata.next.minId : null;
                    $scope.isLoadingParticipations = false;
                }, function(){
                    $scope.isLoadingParticipations = false;
                });
            }

            function _counter(){
                setInterval(function(){
                    if(!$scope.mission || !$scope.mission.time)
                        return;
                    $scope.timeLeft = _getTimeLeft($scope.mission.time.fixedEndDate);
                    $scope.$apply();
                }, 1000);
            }

            function _init(){
                _getMission().then(function(){
                    _getMissionParticipations();
                    $rootScope.pageTitle = '#' + $scope.mission.hashtag;
                });
                _counter();
            }

            $scope.loadMoreParticipations = function(){
                _getMissionParticipations();
            };

            $scope.participate = function(ev){
                $scope.menuIsOpen = false;
                $mdDialog.show({
                    controller: 'ParticipateController',
                    templateUrl: global.APP_CONFIG.APP_DIR + '/modules/mission/templates/participate.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true,
                    locals: {
                        mission: $scope.mission
                    }
                }).then(function() {

                }, function() {

                });
            };

            $scope.challenge = function(ev){
                $scope.menuIsOpen = false;
                $mdDialog.show({
                    controller: 'ChallengeController',
                    templateUrl: global.APP_CONFIG.APP_DIR + '/modules/mission/templates/challenge.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true,
                    locals: {
                        mission: $scope.mission
                    }
                }).then(function() {

                }, function() {

                });
            };

            $scope.toggleMenu = function(){
                if(global.isAndroid())
                    $scope.menuIsOpen = !$scope.menuIsOpen;
            };

            $scope.$watch('menuIsOpen', function(newValue){
                if(!newValue){
                    $scope.tooltipIsOpen = false
                }else{
                    $timeout(function(){
                        $scope.tooltipIsOpen = true;
                    }, 250);
                }
            });

            _init();
        }]);


})(window);
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

    global.squid.mission.factory('missionService', ['$resource',
        function ($resource) {
            return $resource(global.APP_CONFIG.END_POINT_URL() + '/api/mission/:action/:id', {
                action: '@action',
                id: '@id'
            }, {
                getMissionById: {
                    method: 'GET'
                }
            });
        }
    ]);

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

    global.squid.user.controller('MyProfileController', [
        '$scope', 'auth', 'userService', '$location','participationService', 'checkoutService', 'userStatisticsService',
        function ($scope, auth, userService, $location, participationService, checkoutService, userStatisticsService) {

            var firstLoad = true;
            $scope.isLoadingParticipations = false;
            $scope.auth = auth;
            $scope.selectedTabIndex = 0;
            $scope.isLoading = false;
            $scope.userStatistics = {};
            $scope.maxYear = moment().subtract(14, 'years').year();
            $scope.vouchers = [];
            $scope.participations = {
                data: [],
                minId: ''
            };

            function _getUserStatistics(){
                userStatisticsService.getUserProfileStatistics(function(userStatistics){
                    $scope.userStatistics = userStatistics;
                });
            }

            function _getUserVouchers(){
                checkoutService.getVouchersByUser(function(vouchers){
                    $scope.vouchers = vouchers;
                });
            }

            function _getUserParticipation(){
                if($scope.isLoadingParticipations
                    || $scope.participations.data.length > 0 && !$scope.participations.minId
                    || $scope.participations.data.length == 0 && !firstLoad
                )
                    return;

                firstLoad = false;
                $scope.isLoadingParticipations = true;

                participationService.getUserParticipations({
                    id: auth.profile.user_id,
                    minId: $scope.participations.minId,
                    take: 12
                }, function(response){
                    $scope.participations.data = $scope.participations.data
                        .concat(response.data)
                        .distinct(function(c, n){
                            return c._id == n._id;
                        });
                    $scope.participations.minId = response.paginationMetadata.next ? response.paginationMetadata.next.minId : null;
                    $scope.isLoadingParticipations = false;
                }, function(){
                    $scope.isLoadingParticipations = false;
                });
            }

            function _init(){
                if(!auth.isAuthenticated)
                    return;

                _getUserParticipation();
                _getUserVouchers();
                _getUserStatistics();
            }

            $scope.getVoucherUsedLabel = function(isUsed){
                return isUsed ? 'Usado': 'Não usado';
            };

            $scope.loadMoreParticipations = function(){
                if(!auth.isAuthenticated)
                    return;

                _getUserParticipation();
            };

            _init();
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