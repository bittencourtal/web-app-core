(function (global) {
    "use strict";

    global.squid.user.controller('MyProfileController', [
        '$scope', 'auth', 'userService', '$location','participationService', 'checkoutService', 'userStatisticsService',
        function ($scope, auth, userService, $location, participationService, checkoutService, userStatisticsService) {

            var firstLoad = true;
            $scope.isLoadingParticipations = false;
            $scope.auth = auth;
            $scope.selectedTabIndex = 0;
            $scope.isLoading = false;
            $scope.userStatistics = {};
            $scope.maxYear = moment().subtract(14, 'years').year();
            $scope.vouchers = [];
            $scope.participations = {
                data: [],
                minId: ''
            };

            function _getUserStatistics(){
                userStatisticsService.getUserProfileStatistics(function(userStatistics){
                    $scope.userStatistics = userStatistics;
                });
            }

            function _getUserVouchers(){
                checkoutService.getVouchersByUser(function(vouchers){
                    $scope.vouchers = vouchers;
                });
            }

            function _getUserParticipation(){
                if($scope.isLoadingParticipations
                    || $scope.participations.data.length > 0 && !$scope.participations.minId
                    || $scope.participations.data.length == 0 && !firstLoad
                )
                    return;

                firstLoad = false;
                $scope.isLoadingParticipations = true;

                participationService.getUserParticipations({
                    id: auth.profile.user_id,
                    minId: $scope.participations.minId,
                    take: 12
                }, function(response){
                    $scope.participations.data = $scope.participations.data
                        .concat(response.data)
                        .distinct(function(c, n){
                            return c._id == n._id;
                        });
                    $scope.participations.minId = response.paginationMetadata.next ? response.paginationMetadata.next.minId : null;
                    $scope.isLoadingParticipations = false;
                }, function(){
                    $scope.isLoadingParticipations = false;
                });
            }

            function _init(){
                _getUserParticipation();
                _getUserVouchers();
                _getUserStatistics();
            }

            $scope.getVoucherUsedLabel = function(isUsed){
                return isUsed ? 'Usado': 'Não usado';
            };

            $scope.loadMoreParticipations = function(){
                _getUserParticipation();
            };

            _init();
        }]);


})(window);