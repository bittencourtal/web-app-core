(function (global) {
    "use strict";

    global.squid.mission.factory('missionService', ['$resource',
        function ($resource) {
            return $resource(END_POINT_URL + '/api/mission/:action/:id', {
                action: '@action',
                id: '@id'
            }, {
                getMissionById: {
                    method: 'GET'
                }
            });
        }
    ]);

})(window);