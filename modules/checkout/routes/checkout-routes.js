(function (global) {

    global.squid.checkout.config(['$routeProvider', function ($routeProvider) {
        $routeProvider
            .when('/checkout', {
                viewUrl: global.APP_DIR + '/modules/checkout/views/checkout.html',
                templateUrl: global.VIEWS.TEMPLATES.DEFAULT(),
                pageTitle: 'Checkout'
            })
            .when('/checkout/:prizeId', {
                viewUrl: global.APP_DIR + '/modules/checkout/views/checkout-prize.html',
                templateUrl: global.VIEWS.TEMPLATES.DEFAULT(),
                pageTitle: 'Resgatar prêmio',
                secondaryNav: true,
                requireLogin: true
            });
    }]);

})(window);