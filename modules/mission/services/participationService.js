(function (global) {
    "use strict";

    global.squid.mission.factory('participationService', ['$resource',
        function ($resource) {
            return $resource(global.APP_CONFIG.END_POINT_URL() + '/api/participation/:action/:id', {
                action: '@action',
                id: '@id'
            }, {
                getMissionParticipations: {
                    method: 'GET',
                    params: {
                        action: 'mission'
                    }
                },
                getUserParticipations: {
                    method: 'GET',
                    params: {
                        action: 'user'
                    }
                }
            });
        }
    ]);

})(window);