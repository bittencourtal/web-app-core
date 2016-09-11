(function (global) {
    "use strict";

    global.squid.feed.factory('feedService', ['$resource',
        function ($resource) {
            return $resource(global.APP_CONFIG.END_POINT_URL() + '/api/feed/:action/:id', {
                action: '@action',
                id: '@id'
            }, {
                getFeedParticipation: {
                    method: 'GET',
                    params:{
                        action: 'participation'
                    }
                },
                getMissionsActive: {
                    method: 'GET',
                    params:{
                        action: 'mission'
                    }
                }
            });
        }
    ]);

})(window);