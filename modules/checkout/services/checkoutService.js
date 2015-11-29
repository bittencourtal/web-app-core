(function (global) {
    "use strict";

    global.squid.checkout.factory('checkoutService', ['$resource',
        function ($resource) {
            return $resource(END_POINT_URL + '/api/checkout/:action/:id', {
                action: '@action',
                id: '@id'
            }, {
                getCheckouts: {
                    method: 'GET',
                    params:{
                        action: 'missions'
                    }
                },
                getVouchersByUser: {
                    method: 'GET',
                    params:{
                        action: 'vouchers'
                    },
                    isArray: true
                },
                validate: {
                    method: 'GET',
                    params:{
                        action: 'validate'
                    }
                },
                checkoutPrize: {
                    method: 'POST',
                    params:{
                        action: 'prize'
                    }
                }
            });
        }
    ]);

})(window);