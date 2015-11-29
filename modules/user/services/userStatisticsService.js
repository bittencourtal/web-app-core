(function (global) {
    "use strict";

    global.squid.user.factory('userStatisticsService', ['$resource',
        function ($resource) {
            return $resource(END_POINT_URL + '/api/statistics/user/:action/:id', {
                action: '@action',
                id: '@id'
            }, {
                getUserProfileStatistics: {
                    method: 'GET',
                    params:{
                        action: 'me'
                    }
                }
            });
        }
    ]);

})(window);