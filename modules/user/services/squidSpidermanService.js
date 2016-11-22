(function (global) {
    "use strict";

    global.squid.user.factory('squidSpidermanService', ['$resource',
        function ($resource) {
            return $resource(global.APP_CONFIG.SPIDERMAN_END_POINT_URL() + '/:action', {
                action: '@action'
            }, {
                updateUserMetadata: {
                    method: 'PATCH',
                    params:{
                        action: 'usermetadata'
                    }
                },
                getUserMetadata: {
                    method: 'GET',
                    params:{
                        action: 'usermetadata'
                    }
                }
            });
        }
    ]);

})(window);