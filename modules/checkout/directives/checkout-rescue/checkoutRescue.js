(function (global) {
    "use strict";

    global.squid.checkout.directive('checkoutRescue', ['channelService', function (channelService) {
        return {
            templateUrl: global.APP_CONFIG.APP_DIR + '/modules/checkout/directives/checkout-rescue/checkout-rescue.html',
            link: function ($scope, $element, $attrs, $ctrl) {

                $scope.checkoutList = [];
                $scope.isLoading = false;

                function _prizeWithoutAvailableStockExpression(prize){
                    return !prize.hasAvailableStock;
                }

                function _formatCampaignPrizes(point) {
                    return function (prizes) {
                        return Object.assign({}, point, {
                            prizes: prizes,
                            allPrizesSoldOut: prizes.every(_prizeWithoutAvailableStockExpression),
                        });
                    }
                }

                function _parseCheckoutList(points) {
                    return Promise.all(points.map(function (point) {
                        return channelService.getCampaignPrizes({
                                resourceId: point.campaign.id
                            })
                            .$promise
                            .then(_formatCampaignPrizes(point));
                    }));
                }

                function _populateCheckoutList(checkoutList) {
                    $scope.checkoutList = checkoutList;
                }

                function _getCheckouts(minId) {
                    $scope.isLoading = true;
                    channelService.getSelfPoints().$promise
                        .then(_parseCheckoutList)
                        .then(_populateCheckoutList)
                        .then(_hideLoader)
                        .catch(_hideLoader);;
                }

                function _showLoader() {
                    $scope.isLoading = true;
                }

                function _hideLoader() {
                    $scope.isLoading = false;
                }

                $scope.hasPointsAvailable = function (checkout, prize) {
                    return checkout.totalAvaible >= prize.points;
                };

                _getCheckouts();
            }
        }
    }]);

})(window);