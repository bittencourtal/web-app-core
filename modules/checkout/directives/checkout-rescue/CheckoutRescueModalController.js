(function (global) {
    "use strict";

    global.squid.checkout.controller('CheckoutRescueModalController',
        ['$scope', '$modalInstance', 'prize', 'auth', 'checkoutService', 'userService',
            function ($scope, $modalInstance, prize, auth, checkoutService, userService) {
                $scope.prize = prize;
                $scope.email = auth.profile.email;
                $scope.validateStatus = 'carregando...';

                var prizeValidate = false;
                var msgPreencherEmail = false;


                $scope.rescue = function () {
                    _rescue();
                };

                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };


                function _rescue() {
                    if ($scope.email != auth.profile.email) {
                        userService.email({
                            email: $scope.email
                        }, function (result) {
                            _getPrize();
                        }, function (err) {
                            $scope.validateStatus = err.data.message;
                        });
                    } else {
                        _getPrize();
                    }

                }

                function _getPrize() {
                    checkoutService.getPrize({
                        id: prize.id
                    }, function (result) {
                        $scope.validateStatus = result.message;

                    }, function (err) {
                        $scope.validateStatus = err.data.message;

                        if (err.data.message.contains('e-mail')) {
                            msgPreencherEmail = true;
                        }
                    });
                }


                function _validatePrize() {
                    checkoutService.validate({
                        id: prize.id
                    }, function (result) {
                        $scope.validateStatus = result.status;
                        if (result.status.contains('ok'))
                            prizeValidate = true;
                    }, function (err) {
                        $scope.validateStatus = err.data.message;
                    });
                };

                function _init() {
                    _validatePrize();
                }

                _init();
            }
        ]);

}(window));