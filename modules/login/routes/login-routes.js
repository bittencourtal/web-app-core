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