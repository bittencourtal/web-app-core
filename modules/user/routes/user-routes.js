(function (global) {

    global.squid.user.config(['$routeProvider', function ($routeProvider) {
        $routeProvider
            .when('/my-profile', {
                viewUrl: '/modules/user/views/my-profile.html',
                templateUrl: global.VIEWS.TEMPLATES.DEFAULT,
                pageTitle: 'Meu Perfil'
            });
    }]);

})(window);