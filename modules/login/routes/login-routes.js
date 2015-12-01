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