(function(global) {

    global.squid.app.config(['$routeProvider', function($routeProvider) {
        $routeProvider
            .otherwise({
                redirectTo: global.APP_CONFIG.START_VIEW
            });
    }]);

})(window);
