(function (global) {
    "use strict";

    var toastConfig = {
        delay: 10000,
        close: 'OK'
    };

    global.squid.app.directive('toolbar',
        ['$rootScope', '$mdSidenav', '$location', 'auth', 'store', '$mdMedia', 'AboutCampaignModalService', 'feedService', '$mdToast',
            function ($rootScope, $mdSidenav, $location, auth, store, $mdMedia, AboutCampaignModalService, feedService, $mdToast) {
                return {
                    templateUrl: global.APP_CONFIG.APP_DIR + '/directives/toolbar/toolbar.html',
                    restrict: 'EA',
                    replace: true,
                    scope: {},
                    link: function ($scope, $element, $attrs, $controllers) {

                        $scope.APP_CONFIG = global.APP_CONFIG;
                        $scope.$mdSidenav = $mdSidenav;
                        $scope.path = $location.$$path.split("/")[1];
                        $scope.auth = auth;
                        $scope.$location = $location;
                        $scope.uniqueCampaign = null;
                        $scope.isSmallDevice = $mdMedia('sm');
                        $scope.mobileSideMenuUrl = global.APP_CONFIG.APP_DIR + '/directives/toolbar/mobile-side-menu.html';

                        function _logout() {
                            auth.signout();
                            store.remove('profile');
                            store.remove('token');
                            $.jStorage.flush();
                            _redirectToLogin();
                        }

                        function _redirectToLogin() {
                            $location.path(global.LOGIN_ROUTE);
                        }

                        function _redirectToStartView() {
                            $location.path(global.START_VIEW);
                        }

                        function _getToastPosition() {
                            if ($rootScope.isSmallDevice) {
                                return 'bottom left';
                            } else {
                                return 'top right';
                            }
                        }

                        function _notifyNotHaveCampaign() {
                            var toast = $mdToast.simple()
                                .content('Não há campanha cadastrada no momento.')
                                .action(toastConfig.close)
                                .parent($('main').get(0))
                                .hideDelay(toastConfig.delay)
                                .highlightAction(false)
                                .position(_getToastPosition());

                            $mdToast.show(toast).then(function (response) { });
                        }

                        function _loadUniqueCampaign() {
                            if (!APP_CONFIG.CAMPAIGNS.UNIQUE_CAMPAIGN.IS_UNIQUE)
                                return;

                            feedService.getMissionsActive(function (result) {
                                if (!result)
                                    return;

                                var mission = result.data.first();
                                $scope.uniqueCampaign = !!mission ? mission : null;
                            });
                        }

                        $scope.getButtonClass = function (menu) {
                            return {
                                'active': $scope.path == menu
                            };
                        };

                        $scope.goBack = function () {
                            window.history.go(-1);
                        };

                        $scope.vincularConta = function () {
                            try {
                                var data = {
                                    userId: auth.profile.user_id,
                                    redirectUrl: window.location.href,
                                    email: auth.profile.email
                                };

                                var dataStr = JSON.stringify(data);
                                var dataEncode = btoa(dataStr);
                                window.open('https://campanhas.squidit.com.br/v1/vincular-instagram?data=' + dataEncode, '_blank');
                            } catch (e) {
                                console.log(e);
                            }
                        };

                        $scope.goToUniqueCampaign = function () {
                            if (!$scope.uniqueCampaign)
                                return _notifyNotHaveCampaign();

                            $location.path('mission/mission-details/' + $scope.uniqueCampaign._id);
                        };

                        $scope.openAboutCampaign = function () {
                            AboutCampaignModalService.openDialog(auth.profile)
                                .then(function () { }, _logout);
                        };

                        $scope.logout = function () {
                            auth.signout();
                            store.remove('profile');
                            store.remove('token');
                            $.jStorage.flush();

                            if (global.APP_CONFIG.REQUIRE_AUTHENTICATION) {
                                _redirectToLogin();
                            } else {
                                _redirectToStartView();
                            }
                        };

                        _loadUniqueCampaign();
                    }
                }
            }]);

})(window);
