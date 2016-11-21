(function (global) {
    "use strict";

    function CheckoutDialogController(
        $scope,
        $q,
        $mdDialog,
        $mdToast,
        checkoutService,
        campaignId,
        prize,
        saveUserMetadataFn,
        checkoutPrizeFn
    ) {

        $scope.isLoading = false;
        $scope.checkoutDone = false;
        $scope.userPointsAvailable = 0;
        $scope.checkoutSuccess = false;
        $scope.prize = prize;
        $scope.checkoutResultMessage = '';

        function _getPointsAvailable() {
            var defer = $q.defer();

            checkoutService.getPointsAvailable({
                id: campaignId
            }, defer.resolve, defer.reject);

            return defer.promise;
        }

        function _successCheckout(result) {
            $scope.checkoutResultMessage = result.message;
            $scope.checkoutDone = true;
        }

        function _failCheckout(err) {
            var data = err.data;
            $scope.checkoutResultMessage = data.message;
            $scope.checkoutDone = false;
            _hideLoader();
        }

        function _showLoader(){
            $scope.isLoading = true;
        }

        function _hideLoader(){
            $scope.isLoading = false;
        }

        function _populatePointsAvailable(result) {
            $scope.userPointsAvailable = result.total;
        }

        function _resetResultMessage(){
            $scope.checkoutResultMessage = '';
        }

        function _init() {
            _getPointsAvailable()
                .then(_populatePointsAvailable);
        }

        $scope.doCheckout = function () {
            _showLoader();
            saveUserMetadataFn()
                .then(checkoutPrizeFn)
                .then(_successCheckout)
                .then(_hideLoader)
                .catch(_failCheckout);
        };

        $scope.cancel = function () {
            _resetResultMessage();
            $mdDialog.cancel();
        };

        $scope.ok = function() {
            _resetResultMessage();
            $mdDialog.hide($scope.checkoutDone);
        };

        _init();
    }

    global.squid.checkout.controller('CheckoutDialogController', [
        '$scope',
        '$q',
        '$mdDialog',
        '$mdToast',
        'checkoutService',
        'campaignId',
        'prize',
        'saveUserMetadataFn',
        'checkoutPrizeFn',
        CheckoutDialogController
    ]);
    global.squid.checkout.controllers.CheckoutDialogController = CheckoutDialogController;

})(window);