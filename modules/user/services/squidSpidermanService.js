(function (global) {
    "use strict";

    global.squid.user.factory('squidSpidermanService', ['$resource',
        function ($resource) {
            return $resource(global.APP_CONFIG.SPIDERMAN_END_POINT_URL() + '/:action/:id', {
                action: '@action',
                id: '@id'
            }, {
                updateUserMetadata: {
                    method: 'PATCH',
                    params:{
                        action: 'usermetadata'
                    }
                }
            });
        }
    ]);

})(window);