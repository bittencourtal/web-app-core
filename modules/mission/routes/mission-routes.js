(function (global) {

    global.squid.mission.config(['$routeProvider', function ($routeProvider) {
        $routeProvider
            .when('/mission/actives', {
                viewUrl: global.APP_DIR + '/modules/mission/views/actives.html',
                templateUrl: global.VIEWS.TEMPLATES.DEFAULT,
                pageTitle: 'Missões'
            })
            .when('/mission/mission-details/:missionId', {
                viewUrl: global.APP_DIR +  '/modules/mission/views/mission-details.html',
                templateUrl: global.VIEWS.TEMPLATES.DEFAULT,
                pageTitle: '',
                secondaryNav: true
            });
    }]);

})(window);