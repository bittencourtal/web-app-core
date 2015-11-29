(function (global) {

    global.squid.login.config(['$routeProvider', function ($routeProvider) {
        $routeProvider
            .when('/login', {
                viewUrl: '/modules/login/views/index.html',
                templateUrl: '/views/templates/login.html',
                pageTitle: 'Login',
                secondaryNav: true
            });
    }]);

})(window);