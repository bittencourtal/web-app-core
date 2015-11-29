(function (global) {
    "use strict";

    global.squid.mission.factory('shareService', ['$resource',
        function ($resource) {
            return $resource(END_POINT_URL + '/api/share/:action/:id', {
                action: '@action',
                id: '@id'
            }, {
                shareMission: {
                    method: 'POST',
                    params: {
                        action: 'mission'
                    }
                }
            });
        }
    ]);

})(window);