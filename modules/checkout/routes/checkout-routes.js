(function (global) {

    global.squid.checkout.config(['$routeProvider', function ($routeProvider) {
        $routeProvider
            .when('/checkout', {
                viewUrl: '/modules/checkout/views/checkout.html',
                templateUrl: global.VIEWS.TEMPLATES.DEFAULT,
                pageTitle: 'Checkout'
            })
            .when('/checkout/:prizeId', {
                viewUrl: '/modules/checkout/views/checkout-prize.html',
                templateUrl: global.VIEWS.TEMPLATES.DEFAULT,
                pageTitle: 'Resgatar prêmio',
                secondaryNav: true,
                requireLogin: true
            });
    }]);

})(window);