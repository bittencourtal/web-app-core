(function (global) {
    "use strict";

    global.squid.checkout.directive('checkoutHistory', ['checkoutService', function (checkoutService) {
        return {
            templateUrl: global.APP_CONFIG.APP_DIR + '/modules/checkout/directives/checkout-history/checkout-history.html',
            link: function ($scope, $element, $attrs, $ctrl) {

                $scope.isLoading = false;
                $scope.checkoutHistoryList = [];

                function _populateCheckoutHistory(history) {
                    $scope.checkoutHistoryList = history;
                }

                function _getUserCheckoutHistory() {
                    return checkoutService.getUserCheckouts().$promise;
                }

                function _init() {
                    _getUserCheckoutHistory()
                        .then(_populateCheckoutHistory)
                }

                _init();
            }
        }
    }]);

})(window);