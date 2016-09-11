(function (global) {
    "use strict";

    global.squid.user.factory('userService', ['$resource',
        function ($resource) {
            return $resource(global.APP_CONFIG.END_POINT_URL() + '/api/user/:action/:id', {
                action: '@action',
                id: '@id'
            }, {
                email: {
                    method: 'PUT',
                    params:{
                        action: 'email'
                    }
                },
                update: {
                    method: 'PUT'
                }
            });
        }
    ]);

})(window);