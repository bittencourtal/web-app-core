(function (global) {

    global.squid.campaign.config(['$routeProvider', function ($routeProvider) {
        $routeProvider
            .when('/campaign/rank/:campaignId', {
                viewUrl: global.APP_CONFIG.APP_DIR + '/modules/campaign/views/campaign-rank.html',
                templateUrl: global.APP_CONFIG.VIEWS.TEMPLATES.DEFAULT(),
                pageTitle: 'Rank influenciadores'
            });
    }]);

})(window);