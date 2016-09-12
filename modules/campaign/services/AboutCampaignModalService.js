(function (global) {

    var toastConfig = {
        delay: 10000,
        close: 'OK'
    };

    function AboutCampaignController($scope, $mdDialog, AboutCampaignModalService) {

        $scope.currentStep = 'step-1';
        $scope.TEXTS = {
            STEP1: APP_CONFIG.ABOUT_CAMPAIGN.TEXTS.STEP_1,
            STEP2: APP_CONFIG.ABOUT_CAMPAIGN.TEXTS.STEP_2
        };

        $scope.next = function () {
            $scope.currentStep = 'step-2';
        };

        $scope.back = function () {
            $scope.currentStep = 'step-1';
        };

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        $scope.ok = function () {
            $mdDialog.hide(true);
        }
    }

    global.squid.login.controller('AboutCampaignController', ['$scope', '$mdDialog', AboutCampaignController]);

    global.squid.login.factory('AboutCampaignModalService',
        ['$rootScope', '$q', '$mdDialog', '$mdToast', 'userService', 'store',
            function ($rootScope, $q, $mdDialog, $mdToast, userService, store) {

                function _getToastPosition() {
                    if ($rootScope.isSmallDevice) {
                        return 'bottom left';
                    } else {
                        return 'top right';
                    }
                }

                function _updateUserMetadata(profile) {
                    var defer = $q.defer();

                    userService.update(profile.app_metadata, function (response) {
                        defer.resolve(profile);
                    }, function (err) {
                        defer.reject(profile);
                    });

                    return defer.promise;
                }

                function _aboutCampaignNotRead(profile) {
                    var defer = $q.defer();

                    profile.app_metadata = (!!profile.app_metadata) ? profile.app_metadata : {};
                    profile.app_metadata.acceptedTerms = false;
                    store.set('profile', profile);

                    var toast = $mdToast.simple()
                        .content('Confirme a leitura sobre a campanha para poder navegar e participar.')
                        .action(toastConfig.close)
                        .parent($('main').get(0))
                        .hideDelay(toastConfig.delay)
                        .highlightAction(false)
                        .position(_getToastPosition());

                    $mdToast.show(toast).then(function (response) { });

                    _updateUserMetadata(profile)
                        .then(defer.resolve, defer.reject);

                    return defer.promise;
                }

                function _aboutCampaignRead(acceptTerms, profile) {
                    var defer = $q.defer();

                    profile.app_metadata = (!!profile.app_metadata) ? profile.app_metadata : {};
                    profile.app_metadata.acceptedTerms = acceptTerms;
                    store.set('profile', profile);

                    _updateUserMetadata(profile)
                        .then(defer.resolve, defer.reject);

                    return defer.promise;
                }

                function _openDialog(profile) {
                    var defer = $q.defer();

                    $mdDialog.show({
                        controller: AboutCampaignController,
                        templateUrl: global.APP_CONFIG.APP_DIR + '/modules/campaign/views/about-campaign-dialog.html',
                        parent: angular.element(document.body),
                        clickOutsideToClose: true
                    }).then(function (aboutCampaignRead) {
                        _aboutCampaignRead(aboutCampaignRead, profile)
                            .then(defer.resolve, defer.reject);
                    }, function () {
                        _aboutCampaignNotRead(profile)
                            .then(defer.reject, defer.reject);
                    });

                    return defer.promise;
                }

                return {
                    openDialog: _openDialog
                }
            }]);

})(window);