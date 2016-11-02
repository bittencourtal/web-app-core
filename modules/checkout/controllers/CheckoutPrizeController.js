(function (global) {
    "use strict";

    var toastConfig = {
        delay: 30000,
        close: 'OK'
    };

    global.squid.checkout.controller('CheckoutPrizeController', [
        '$scope', '$rootScope', 'checkoutService', 'userService', 'prizeService', '$mdToast', '$mdDialog', '$routeParams', 'auth', '$location', '$q',
        function ($scope, $rootScope, checkoutService, userService, prizeService, $mdToast, $mdDialog, $routeParams, auth, $location, $q) {

            $scope.auth = auth;
            $scope.userMetadata = {};
            $scope.isLoading = false;
            $scope.prize = {};

            function _getToastPosition(){
                if($rootScope.isSmallDevice){
                    return 'bottom left';
                }else{
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

            function _checkoutPrize(){
                var defer = $q.defer();

                checkoutService.checkoutPrizeWithoutEmailValidation({
                    id: $routeParams.prizeId
                }, defer.resolve, defer.reject);

                return defer.promise;
            }

            function _successCheckout(result){
                var toast = $mdToast.simple()
                    .content(result.message)
                    .action(toastConfig.close)
                    .parent($('main').get(0))
                    .hideDelay(toastConfig.delay)
                    .highlightAction(false)
                    .position(_getToastPosition());

                $mdToast.show(toast).then(function(response) {});

                $scope.isLoading = false;
                $location.path('checkout');
            }

            function _failCheckout(err){
                $scope.isLoading = false;

                if(!err)
                    return;

                var data = err.data;
                var toast = $mdToast.simple()
                    .content(data.message)
                    .action(toastConfig.close)
                    .parent($('main').get(0))
                    .hideDelay(toastConfig.delay)
                    .highlightAction(false)
                    .position(_getToastPosition());

                $mdToast.show(toast).then(function(response) {});
            }

            function _init(){
                $scope.isLoading = true;

                _getPrize()
                    .then(function(){
                        $scope.isLoading = false;
                    });
            }

            $scope.saveUserMetadata = function(){ }; // user-metadata-directive will override this method!

            $scope.rescue = function(){
                $scope.isLoading = true;

                $scope.saveUserMetadata()
                    .then(_checkoutPrize)
                    .then(_successCheckout)
                    .catch(_failCheckout);
            };

            _init();
        }
    ]);

})(window);