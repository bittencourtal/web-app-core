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

                $rootScope.pageTitle = "";

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

                function _persistToken(){
                    var token = store.get('token');

                    if(!token)
                        return;

                    !jwtHelper.isTokenExpired(token)
                        ? auth.authenticate(store.get('profile'), token)
                        : $.jStorage.flush();
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

                function _onLocationChangeStart(){
                    _persistToken();

                    if (auth.isAuthenticated)
                        return;

                    $.jStorage.flush();
                    if (global.APP_CONFIG.REQUIRE_AUTHENTICATION)
                        _redirectToLogin();
                }

                function _onRouteChangeSuccess(ev, nextRoute){
                    WorkflowInitializer
                        .initWorkflows(global.APP_CONFIG.WORKFLOWS.ROUTES.CHANGED)
                        .catch(_logout);

                    if (_nextRouteRequireLogin(nextRoute) && !auth.isAuthenticated)
                        _redirectToLogin();
                }

                $rootScope.setPageTitle = function (title) {
                    $rootScope.pageTitle = title;
                };

                $rootScope.$on('$locationChangeStart', _onLocationChangeStart);
                $rootScope.$on('$routeChangeSuccess', _onRouteChangeSuccess);
                auth.hookEvents();
            }
        ]);

})(window);
