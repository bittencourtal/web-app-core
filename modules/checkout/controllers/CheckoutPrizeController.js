(function (global) {
    "use strict";

    var toastConfig = {
        delay: 30000,
        close: 'OK'
    };

    var _checkoutControllers = global.squid.checkout.controllers;

    global.squid.checkout.controller('CheckoutPrizeController', [
        '$scope',
        '$rootScope',
        'checkoutService',
        'userService',
        'prizeService',
        '$mdToast',
        '$mdDialog',
        '$routeParams',
        'auth',
        '$location',
        'campaignService',
        '$q',
        function (
            $scope,
            $rootScope,
            checkoutService,
            userService,
            prizeService,
            $mdToast,
            $mdDialog,
            $routeParams,
            auth,
            $location,
            campaignService,
            $q) {

            $scope.auth = auth;
            $scope.userMetadata = {};
            $scope.isLoading = false;
            $scope.prize = {};

            function _getToastPosition() {
                if ($rootScope.isSmallDevice) {
                    return 'bottom left';
                } else {
                    return 'top right';
                }
            }

            function _getPrize() {
                var defer = $q.defer();

                prizeService.get({
                    id: $routeParams.prizeId
                }, function (prize) {
                    $scope.prize = prize;
                    defer.resolve(prize);
                }, defer.reject);

                return defer.promise;
            }

            function _checkoutPrize() {
                var defer = $q.defer();

                var campaignId = $scope.prize.mission;

                campaignService.checkoutPrize({
                    idCampaign: campaignId,
                    resourceId: $routeParams.prizeId
                }, defer.resolve, defer.reject);

                return defer.promise;
            }

            function _openConfirmCheckoutModal() {
                var defer = $q.defer();

                $mdDialog.show({
                    controller: _checkoutControllers.CheckoutDialogController,
                    templateUrl: global.APP_CONFIG.APP_DIR + '/modules/checkout/views/checkout-dialog.html',
                    parent: angular.element(document.body),
                    clickOutsideToClose: false,
                    escapeToClose: false,
                    locals: {
                        campaignId: $scope.prize.mission,
                        saveUserMetadataFn: $scope.saveUserMetadata,
                        checkoutPrizeFn: _checkoutPrize,
                        prize: $scope.prize
                    }
                }).then(defer.resolve, defer.reject);

                return defer.promise;
            }

            function _checkoutDone(success){
                if(!success)
                    return;

                $location.path('checkout');
            }

            function _init() {
                $scope.isLoading = true;

                _getPrize()
                    .then(function () {
                        $scope.isLoading = false;
                    });
            }

            $scope.saveUserMetadata = function () {}; // user-metadata-directive will override this method!

            $scope.rescue = function () {
                _openConfirmCheckoutModal()
                    .then(_checkoutDone);
            };

            _init();
        }
    ]);

})(window);