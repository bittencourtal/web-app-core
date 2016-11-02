(function (global) {
    "use strict";

    var toastConfig = {
        delay: 10000,
        close: 'OK'
    };

    global.squid.user.controller('MyProfileController', [
        '$scope',
        '$rootScope',
        'auth',
        'userService',
        '$location',
        'participationService',
        'checkoutService',
        'userStatisticsService',
        '$mdToast',
        function (
            $scope,
            $rootScope,
            auth,
            userService,
            $location,
            participationService,
            checkoutService,
            userStatisticsService,
            $mdToast
        ) {

            var firstLoad = true;
            $scope.isSaving = false;
            $scope.isLoadingParticipations = false;
            $scope.auth = auth;
            $scope.userMetadata = {};
            $scope.selectedTabIndex = 0;
            $scope.isLoading = false;
            $scope.userStatistics = {};
            $scope.vouchers = [];
            $scope.participations = {
                data: [],
                minId: ''
            };

            function _getToastPosition() {
                if ($rootScope.isSmallDevice) {
                    return 'bottom left';
                } else {
                    return 'top right';
                }
            }

            function _getUserStatistics() {
                userStatisticsService.getUserProfileStatistics(function (userStatistics) {
                    $scope.userStatistics = userStatistics;
                });
            }

            function _getUserVouchers() {
                checkoutService.getVouchersByUser(function (vouchers) {
                    $scope.vouchers = vouchers;
                });
            }

            function _canNotLoadParticipations() {
                return $scope.isLoadingParticipations ||
                    $scope.participations.data.length > 0 && !$scope.participations.minId ||
                    $scope.participations.data.length == 0 && !firstLoad;
            }

            function _onUserMetadataSaved(userMetadata) {
                var toast = $mdToast.simple()
                    .content('Dados salvos :)')
                    .action(toastConfig.close)
                    .parent($('main').get(0))
                    .hideDelay(toastConfig.delay)
                    .highlightAction(false)
                    .position(_getToastPosition());

                $mdToast.show(toast).then(function (response) {});
            }

            function _getUserParticipation() {
                if (_canNotLoadParticipations())
                    return;

                firstLoad = false;
                $scope.isLoadingParticipations = true;

                participationService.getUserParticipations({
                    id: auth.profile.user_id,
                    minId: $scope.participations.minId,
                    take: 12
                }, function (response) {
                    $scope.participations.data = $scope.participations.data
                        .concat(response.data)
                        .distinct(function (c, n) {
                            return c._id == n._id;
                        });
                    $scope.participations.minId = response.paginationMetadata.next ? response.paginationMetadata.next.minId : null;
                    $scope.isLoadingParticipations = false;
                }, function () {
                    $scope.isLoadingParticipations = false;
                });
            }

            function _init() {
                if (!auth.isAuthenticated)
                    return;

                _getUserParticipation();
                _getUserVouchers();
                _getUserStatistics();
            }

            $scope.getVoucherUsedLabel = function (isUsed) {
                return isUsed ? 'Usado' : 'Não usado';
            };

            $scope.loadMoreParticipations = function () {
                if (!auth.isAuthenticated)
                    return;

                _getUserParticipation();
            };

            $scope.save = function () {
                $scope.saveUserMetadata()
                    .then(_onUserMetadataSaved);
            };

            $scope.saveUserMetadata = function () {}; // user-metadata-directive will override this method!

            $scope.getSaveButtonLabel = function () {
                return $scope.isSaving ? 'Salvando...' : 'Salvar';
            };

            _init();
        }
    ]);


})(window);