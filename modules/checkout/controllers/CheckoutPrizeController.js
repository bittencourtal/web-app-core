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
        'userService',
        'channelService',
        '$mdToast',
        '$mdDialog',
        '$routeParams',
        'auth',
        '$location',
        function (
            $scope,
            $rootScope,
            userService,
            channelService,
            $mdToast,
            $mdDialog,
            $routeParams,
            auth,
            $location) {
            $scope.auth = auth;
            $scope.userMetadata = {};
            $scope.isLoading = false;
            $scope.prize = {};

            var campaignId = $routeParams.campaignId;
            var prizeId = $routeParams.prizeId;

            function _getToastPosition() {
                if ($rootScope.isSmallDevice) {
                    return 'bottom left';
                } else {
                    return 'top right';
                }
            }

            function _getPrize() {
                return channelService.getPrize({
                    resourceId: campaignId,
                    actionId: prizeId
                }).$promise;
            }

            function _checkoutPrize() {
                var campaignId = $scope.prize.mission;
                return channelService.createCheckout({
                    resourceId: campaignId,
                    action: prizeId
                }).$promise;
            }

            function _openConfirmCheckoutModal() {
                return $mdDialog.show({
                    controller: _checkoutControllers.CheckoutDialogController,
                    templateUrl: global.APP_CONFIG.APP_DIR + '/modules/checkout/views/checkout-dialog.html',
                    parent: angular.element(document.body),
                    clickOutsideToClose: false,
                    escapeToClose: false,
                    locals: {
                        campaignId: campaignId,
                        saveUserMetadataFn: $scope.saveUserMetadata,
                        checkoutPrizeFn: _checkoutPrize,
                        prize: $scope.prize
                    }
                });
            }

            function _checkoutDone(success){
                if(!success)
                    return;

                $location.path('checkout');
            }

            function _init() {
                $scope.isLoading = true;
                _getPrize()
                    .then(function (prize) {
                        $scope.prize = prize;
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