(function(global){

    var _modulesDependencies = [
        'squid-login',
        'squid-feed',
        'squid-mission',
        'squid-checkout',
        'squid-user'
    ];

    global.squid.app = angular.module("squid-app", global.squid.defaultDependencies.concat(_modulesDependencies));

    global.squid.app.run(
        ['$rootScope', 'auth', 'store', 'jwtHelper', '$location',
            function($rootScope, auth, store, jwtHelper, $location) {
                $rootScope = $rootScope || {};

                $rootScope.pageTitle = "";

                $rootScope.setPageTitle = function(title) {
                    $rootScope.pageTitle = title;
                };

                $rootScope.$on('$locationChangeStart', function() {
                    var token = store.get('token');
                    if (token) {
                        if (!jwtHelper.isTokenExpired(token)) {
                            auth.authenticate(store.get('profile'), token);
                        } else {
                            $.jStorage.flush();
                        }
                    }

                    if (!auth.isAuthenticated) {
                        $.jStorage.flush();
                        return;
                    }
                });

                auth.hookEvents();
            }
        ]);

})(window);