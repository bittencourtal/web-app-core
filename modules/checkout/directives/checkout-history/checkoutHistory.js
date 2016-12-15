(function (global) {
    "use strict";

    global.squid.checkout.directive('checkoutHistory', ['checkoutService', 'auth', function (checkoutService, auth) {
        return {
            scope: {},
            templateUrl: global.APP_CONFIG.APP_DIR + '/modules/checkout/directives/checkout-history/checkout-history.html',
            link: function ($scope, $element, $attrs, $ctrl) {

                $scope.isLoading = false;
                $scope.auth = auth;
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

                $scope.getStatusLabel = function (status) {
                    switch (status) {
                        case 'requested':
                            return 'Solicitado';

                        case 'approved':
                            return 'Aprovado';

                        case 'reproved':
                            return 'Reprovado';

                        default:
                            return '?';
                    }
                };

                _init();
            }
        }
    }]);

})(window);