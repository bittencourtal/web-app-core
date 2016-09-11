(function (global) {

    global.squid.checkout.config(['$routeProvider', function ($routeProvider) {
        $routeProvider
            .when('/checkout', {
                viewUrl: global.APP_CONFIG.APP_DIR + '/modules/checkout/views/checkout.html',
                templateUrl: global.APP_CONFIG.VIEWS.TEMPLATES.DEFAULT(),
                pageTitle: 'Meus Pontos',
                requireLogin: true
            })
            .when('/checkout/:prizeId', {
                viewUrl: global.APP_CONFIG.APP_DIR + '/modules/checkout/views/checkout-prize.html',
                templateUrl: global.APP_CONFIG.VIEWS.TEMPLATES.DEFAULT(),
                pageTitle: 'Resgatar prêmio',
                secondaryNav: true,
                requireLogin: true
            });
    }]);

})(window);
