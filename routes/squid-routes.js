(function(global) {

    global.squid.app.config(['$routeProvider', function($routeProvider) {
        $routeProvider
            .otherwise({
                redirectTo: '/mission/actives'
            });
    }]);

})(window);