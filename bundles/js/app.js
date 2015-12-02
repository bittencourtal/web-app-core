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
(function(global){

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
            function($rootScope, auth, store, jwtHelper, $location) {
                $rootScope = $rootScope || {};

                $rootScope.pageTitle = "";

                $rootScope.setPageTitle = function(title) {
                    $rootScope.pageTitle = title;
                };

                $rootScope.$on('$locationChangeStart', function() {
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
                        return;
                    }
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
        if(global.THEME.CUSTOM){
            $mdThemingProvider.definePalette(global.THEME.PRIMARY_COLOR.name, global.THEME.PRIMARY_COLOR.value);
            $mdThemingProvider._PALETTES[global.THEME.PRIMARY_COLOR.name] = global.THEME.PRIMARY_COLOR.value;

            $mdThemingProvider.definePalette(global.THEME.SECONDARY_COLOR.name, global.THEME.SECONDARY_COLOR.value);
            $mdThemingProvider._PALETTES[global.THEME.SECONDARY_COLOR.name] = global.THEME.SECONDARY_COLOR.value;
        }

        $mdThemingProvider.theme('default')
            .primaryPalette(global.THEME.PRIMARY_COLOR.name)
            .accentPalette(global.THEME.SECONDARY_COLOR.name);
    }

    global.squid.app.config(
        ['$httpProvider', 'authProvider', 'jwtInterceptorProvider', '$mdThemingProvider','$mdIconProvider', '$provide', '$compileProvider',
            function($httpProvider, authProvider, jwtInterceptorProvider, $mdThemingProvider, $mdIconProvider, $provide, $compileProvider) {
                $httpProvider.defaults.useXDomain = true;
                delete $httpProvider.defaults.headers.common['X-Requested-With'];

                authProvider.init({
                    domain: AUTH0_DOMAIN,
                    clientID: AUTH0_CLIENT_ID,
                    loginUrl: '/login'
                });

                jwtInterceptorProvider.tokenGetter = function(store) { return store.get('token'); };
                $httpProvider.interceptors.push('jwtInterceptor');
                $httpProvider.interceptors.push('appIdInjector');
                $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension|whatsapp):/);

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
            $scope.APP_DIR = global.APP_DIR;

            $scope.scrollToUp = function(){
                $('html, body').animate({
                    scrollTop: 0
                }, 1500);
            };

            $scope.$on('$routeChangeStart', function() {
                $scope.isLoading = true;
                console.log('Start');
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

                if(nextRoute && nextRoute.$$route && nextRoute.$$route.requireLogin && !auth.isAuthenticated)
                    $location.path(global.START_VIEW);
            });

            mdThemeColorsDSS.init();
        }
    ]);

})(window);


(function(global){
    "use strict";

    global.squid.app.directive('toolbar',
        ['$mdSidenav', '$location', 'auth', 'store', '$mdMedia',
            function($mdSidenav, $location, auth, store, $mdMedia){
                return {
                    templateUrl: global.APP_DIR + '/directives/toolbar/toolbar.html',
                    restrict: 'EA',
                    replace: true,
                    link: function($scope, $element, $attrs, $controllers){

                        $scope.$mdSidenav = $mdSidenav;
                        $scope.path = $location.$$path.split("/")[1];
                        $scope.auth = auth;
                        $scope.$location = $location;
                        $scope.isSmallDevice = $mdMedia('sm');
                        $scope.mobileSideMenuUrl = global.APP_DIR + '/directives/toolbar/mobile-side-menu.html';

                        $scope.getButtonClass = function (menu) {
                            return {
                                'active': $scope.path == menu
                            };
                        };

                        $scope.goBack = function(){
                            window.history.go(-1);
                        };

                        $scope.logout = function () {
                            auth.signout();
                            store.remove('profile');
                            store.remove('token');
                            $.jStorage.flush();
                        };

                    }
                }
            }]);

})(window);
(function(global){

    global.squid.app.factory('appIdInjector', [function() {
        var appIdInjector = {
            request: function(config) {
                config.headers['app_id'] = global.APP_ID;
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

	global.squid.feed = angular.module("squid-feed", []);

})(window);
(function(global) {

	global.squid.checkout = angular.module("squid-checkout", []);

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
    "use strict";

    global.squid.feed.controller('FeedController', [
        '$scope', 'feedService',
        function ($scope, feedService) {

            $scope.feedList = [];
            $scope.paginationMetadata = {};
            $scope.isLoading = false;

            function _loadFeed(minId){
                var query = {};

                if(minId)
                    query.minId = minId;

                $scope.isLoading = true;

                feedService.getFeedParticipation(query, function (result) {
                    $scope.feedList = $scope.feedList.concat(result.data);
                    $scope.paginationMetadata = result.paginationMetadata;
                    $scope.isLoading = false;
                }, function (err) {
                    $scope.isLoading = false;
                });
            }

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
                viewUrl: global.APP_DIR + '/modules/feed/views/feed.html',
                templateUrl: global.VIEWS.TEMPLATES.DEFAULT(),
                pageTitle: 'Feed'
            });
    }]);

})(window);
(function (global) {
    "use strict";

    global.squid.feed.factory('feedService', ['$resource',
        function ($resource) {
            return $resource(END_POINT_URL + '/api/feed/:action/:id', {
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
                viewUrl: global.APP_DIR + '/modules/checkout/views/checkout.html',
                templateUrl: global.VIEWS.TEMPLATES.DEFAULT(),
                pageTitle: 'Checkout'
            })
            .when('/checkout/:prizeId', {
                viewUrl: global.APP_DIR + '/modules/checkout/views/checkout-prize.html',
                templateUrl: global.VIEWS.TEMPLATES.DEFAULT(),
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
            return $resource(END_POINT_URL + '/api/checkout/:action/:id', {
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
            return $resource(END_POINT_URL + '/api/prize/:action/:id', {
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

    global.squid.login.config(['$routeProvider', function ($routeProvider) {
        $routeProvider
            .when('/login', {
                viewUrl: global.APP_DIR + '/modules/login/views/index.html',
                templateUrl: global.VIEWS.TEMPLATES.LOGIN,
                pageTitle: 'Login',
                secondaryNav: true
            });
    }]);

})(window);
/* jshint undef: true, unused: false */
/* global app, window */

(function (global) {

    global.squid.login.controller('LoginController', [
        '$scope', 'auth', '$location', 'store',
        function ($scope, auth, $location, store) {

            var dict = {
                loadingTitle: 'carregando...',
                close: 'fechar',
                signin: {
                    wrongEmailPasswordErrorText: 'E-mail ou senha inválidos.',
                    serverErrorText: 'Você não está autorizado.',
                    strategyEmailInvalid: 'O e-mail é invalido.',
                    strategyDomainInvalid: 'O domínio {domain} não foi configurado.'
                },
                signup: {
                    serverErrorText: 'Não foi possível se cadastrar.'
                },
                reset: {
                    serverErrorText: 'Não foi possível resetar a senha.'
                }
            };

            function _initAuthLockComponent() {
                auth.config.auth0lib.$container = null;
                auth.signin({
                        container: 'login-box',
                        dict: dict
                    }, function (profile, token) {
                        store.set('profile', profile);
                        store.set('token', token);

                        if (_containsAllData(profile))
                            $location.path(global.START_VIEW);
                        else
                            $location.path('/register');
                    }
                    ,
                    function (error) {

                    }
                )
                ;
            }

            function _containsAllData(profile) {
                return profile.birthDate && profile.gender;
            }

            function _redirectIfIsLoggedIn() {
                if (auth.isAuthenticated)
                    $location.path(global.START_VIEW);
            }

            _redirectIfIsLoggedIn();
            _initAuthLockComponent();

        }

    ])
    ;

})(window);
(function (global) {

    global.squid.mission.config(['$routeProvider', function ($routeProvider) {
        $routeProvider
            .when('/mission/actives', {
                viewUrl: global.APP_DIR + '/modules/mission/views/actives.html',
                templateUrl: global.VIEWS.TEMPLATES.DEFAULT(),
                pageTitle: 'Missões'
            })
            .when('/mission/mission-details/:missionId', {
                viewUrl: global.APP_DIR +  '/modules/mission/views/mission-details.html',
                templateUrl: global.VIEWS.TEMPLATES.DEFAULT(),
                pageTitle: '',
                secondaryNav: true
            });
    }]);

})(window);
(function (global) {
    "use strict";

    global.squid.mission.controller('ActiveMissionController', [
        '$scope', 'feedService',
        function ($scope, feedService) {

            $scope.feedList = [];
            $scope.paginationMetadata = {};
            $scope.isLoading = false;

            function _loadFeed(minId){
                var query = {};

                if(minId)
                    query.minId = minId;

                $scope.isLoading = true;

                feedService.getMissionsActive(query, function (result) {
                    $scope.feedList = $scope.feedList.concat(result.data);
                    $scope.paginationMetadata = result.paginationMetadata;
                    $scope.isLoading = false;
                }, function (err) {
                    $scope.isLoading = false;
                });
            }

            $scope.loadMore = function () {
                if ($scope.isLoading || !$scope.paginationMetadata.next)
                    return;

                _loadFeed($scope.paginationMetadata.next.minId);
            };


            _loadFeed();

        }]);


})(window);
(function(global){

    global.squid.mission.controller('ChallengeController',
        ['$scope', 'mission', '$mdDialog', 'shareService',
            function($scope, mission, $mdDialog, shareService){

                $scope.mission = mission;
                $scope.isMobile = global.isIOS() || global.isAndroid();
                $scope.urlToShare = window.location.href;
                $scope.textToShare = '';
                $scope.descriptionToShare = '';

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

                $scope.removeHash = function(text){
                    if(!text)
                        return;

                    return text.replaceAll('#', '%23');
                };
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
                    templateUrl: global.APP_DIR + '/modules/mission/templates/participate.html',
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
                    templateUrl: global.APP_DIR + '/modules/mission/templates/challenge.html',
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
    "use strict";

    global.squid.mission.factory('missionService', ['$resource',
        function ($resource) {
            return $resource(END_POINT_URL + '/api/mission/:action/:id', {
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
            return $resource(END_POINT_URL + '/api/participation/:action/:id', {
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
            return $resource(END_POINT_URL + '/api/share/:action/:id', {
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
                viewUrl: global.APP_DIR + '/modules/user/views/my-profile.html',
                templateUrl: global.VIEWS.TEMPLATES.DEFAULT(),
                pageTitle: 'Meu Perfil'
            });
    }]);

})(window);
(function (global) {
    "use strict";

    global.squid.user.factory('userService', ['$resource',
        function ($resource) {
            return $resource(END_POINT_URL + '/api/user/:action/:id', {
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
            return $resource(END_POINT_URL + '/api/statistics/user/:action/:id', {
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