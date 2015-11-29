(function (global) {
    "use strict";

    global.squid.checkout.factory('prizeService', ['$resource',
        function ($resource) {
            return $resource(END_POINT_URL + '/api/prize/:action/:id', {
                action: '@action',
                id: '@id'
            }, {
                get: {
                    method: 'GET'
                }
            });
        }
    ]);

})(window);