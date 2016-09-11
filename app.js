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
