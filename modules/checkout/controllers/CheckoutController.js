(function (global) {
    "use strict";

    global.squid.checkout.controller('CheckoutController', [
        '$scope', 'checkoutService',
        function ($scope, checkoutService) {

            $scope.checkoutList = [];
            $scope.paginationMetadata = {};
            $scope.isLoading = false;

            function _getCheckouts(minId) {
                var query = {};

                if(minId)
                    query.minId = minId;

                $scope.isLoading = true;

                checkoutService.getCheckouts(query, function (result) {
                    $scope.checkoutList = $scope.checkoutList.concat(result.data);
                    $scope.paginationMetadata = result.paginationMetadata;
                    $scope.isLoading = false;
                }, function (err) {
                    $scope.isLoading = false;
                });
            }

            $scope.loadMore = function () {
                if ($scope.isLoading || !$scope.paginationMetadata.next)
                    return;

                _getCheckouts($scope.paginationMetadata.next.minId);
            };

            $scope.hasPointsAvailable = function (checkout, prize) {
                return checkout.pointsAvailable >= prize.points;
            };

            _getCheckouts();

        }]);

})(window);