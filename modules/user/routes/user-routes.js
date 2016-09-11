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