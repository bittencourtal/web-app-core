(function (global) {

    function RedirectController($location, $timeout, auth) {

        var tries = 0;

        function _redirectToStartView(){
            $location.path(global.APP_CONFIG.START_VIEW);
        }

        function _redirectToLogin(){
            $location.path(global.APP_CONFIG.LOGIN_ROUTE);
        }

        function _tryRedirect(){
            tries++;

            if(!global.APP_CONFIG.REQUIRE_AUTHENTICATION)
                return _redirectToStartView();

            if(tries > 20)
                return _redirectToLogin();
                    
            if(!auth.isAuthenticated)
                return $timeout(_tryRedirect, 500);

            _redirectToStartView();
        }

        _tryRedirect();
    }

    global.squid.app.controller('RedirectController', ['$location', '$timeout', 'auth', RedirectController]);

    global.squid.app.config(['$routeProvider', function ($routeProvider) {
        $routeProvider
            .when('/redirect', {
                controller: 'RedirectController',
                templateUrl: global.APP_CONFIG.VIEWS.TEMPLATES.DEFAULT()
            })
            .otherwise({
                redirectTo: '/redirect'
            });
    }]);

})(window);