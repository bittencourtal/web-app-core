(function (global) {

    global.squid.feed.config(['$routeProvider', function ($routeProvider) {
        $routeProvider
            .when('/feed', {
                viewUrl: global.APP_CONFIG.APP_DIR + '/modules/feed/views/feed.html',
                templateUrl: global.APP_CONFIG.VIEWS.TEMPLATES.DEFAULT(),
                pageTitle: 'Feed'
            });
    }]);

})(window);