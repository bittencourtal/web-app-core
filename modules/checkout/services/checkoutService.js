(function (global) {
    "use strict";

    global.squid.checkout.factory('checkoutService', ['$resource', function ($resource) {
        return $resource(global.APP_CONFIG.CAMPAIGN_END_POINT_URL() + '/checkouts/:resource/:resourceId', {
            resource: '@resource',
            resourceId: '@resourceId'
        }, {
            getUserCheckouts: {
                method: 'GET',
                params: {
                    resource: 'user',
                    resourceId: 'self'
                },
                isArray: true
            }
        });
    }]);

})(window);