(function (global) {
    "use strict";

    var toastConfig = {
        delay: 30000,
        close: 'OK'
    };

    global.squid.checkout.controller('CheckoutPrizeController', [
        '$scope', '$rootScope', 'checkoutService', 'userService', 'prizeService', '$mdToast', '$mdDialog', '$routeParams', 'auth', '$location',
        function ($scope, $rootScope, checkoutService, userService, prizeService, $mdToast, $mdDialog, $routeParams, auth, $location) {

            $scope.auth = auth;
            $scope.userMetadata = {};
            $scope.isLoading = false;
            $scope.currentTabIndex = 0;
            $scope.maxYear = moment().subtract(5, 'year').year();
            $scope.prize = {};

            function _bindProfileData(){
                var _profileBirthDate = moment(auth.profile.birthDate);

                $scope.birthDate = {
                    day: auth.profile.birthDate ? _profileBirthDate.date() : '',
                    month: auth.profile.birthDate ? _profileBirthDate.month() + 1 : '',
                    year: auth.profile.birthDate ? _profileBirthDate.year() : ''
                };

                $scope.userMetadata.emailContact = auth.profile.emailContact;
                $scope.userMetadata.phone = auth.profile.phone;
                $scope.userMetadata.address = auth.profile.address;
                $scope.userMetadata.birthDate = auth.profile.birthDate;
                $scope.userMetadata.gender = auth.profile.gender;
            }

            function _getPrize() {
                var deferred = new $.Deferred();

                prizeService.get({
                    id: $routeParams.prizeId
                }, function (prize) {
                    $scope.prize = prize;
                    deferred.resolve(prize);
                }, function (err) {
                    deferred.reject(err);
                });

                return deferred.promise();
            }

            function _bindBirthDate(){
                $scope.userMetadata.birthDate = moment({
                    day: $scope.birthDate.day,
                    month: ($scope.birthDate.month - 1),
                    year: $scope.birthDate.year
                });
            }

            function _updateUserMetadata(){
                var deferred = new $.Deferred();

                _bindBirthDate();

                userService.update($scope.userMetadata, function(result){
                    deferred.resolve(result);
                }, function(err){
                    deferred.reject(err);
                });

                return deferred.promise();
            }

            function _checkoutPrize(){
                var deferred = new $.Deferred();

                checkoutService.checkoutPrize({
                    id: $routeParams.prizeId
                }, function(result){
                    deferred.resolve(result);
                }, function(err){
                    deferred.reject(err);
                });

                return deferred.promise();
            }

            function _getToastPosition(){
                if($rootScope.isSmallDevice){
                    return 'bottom left';
                }else{
                    return 'top right';
                }
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
                var data = err.data;

                var toast = $mdToast.simple()
                    .content(data.message)
                    .action(toastConfig.close)
                    .parent($('main').get(0))
                    .hideDelay(toastConfig.delay)
                    .highlightAction(false)
                    .position(_getToastPosition());

                $mdToast.show(toast).then(function(response) {});

                $scope.isLoading = false;
            }

            function _failUpdateProfileInfo(){

                var toast = $mdToast.simple()
                    .content('Não foi possível atualizar as informações de perfil.')
                    .action(toastConfig.close)
                    .parent($('main').get(0))
                    .hideDelay(toastConfig.delay)
                    .highlightAction(false)
                    .position(_getToastPosition());

                $mdToast.show(toast).then(function(response) {});

                $scope.isLoading = false;
            }

            function _init(){
                $scope.isLoading = true;

                _getPrize().then(function(){
                    $scope.isLoading = false;
                });
            }

            $scope.onTabSelected = function(tabIndex){
                $scope.currentTabIndex = tabIndex;
            };

            $scope.currentStepIsValid = function(){
                if(!$scope.userProfile || !$scope.userProfile.emailContact)
                    return false;

                switch($scope.currentTabIndex){
                    case 0:
                        return $scope.userProfile.emailContact.$valid && $scope.userProfile.phone.$valid;

                    case 1:
                        return $scope.userProfile.address.$valid;

                    case 2:
                        return $scope.userProfile.birthDateDay.$valid && $scope.userProfile.birthDateMonth.$valid && $scope.userProfile.birthDateYear.$valid;

                    case 3:
                        return $scope.userProfile.gender.$valid;
                }
            };

            $scope.nextStep = function(){
              $scope.currentTabIndex++;
            };

            $scope.rescue = function(){
                $scope.isLoading = true;

                _updateUserMetadata().then(function(result){
                    _checkoutPrize().then(_successCheckout, _failCheckout);
                }, _failUpdateProfileInfo);
            };

            _init();

            $scope.$watch('auth.profile', function(){
                _bindProfileData();
            });
        }
    ]);

})(window);