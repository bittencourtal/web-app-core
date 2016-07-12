(function(global){
    "use strict";

    global.squid.app.directive('toolbar',
        ['$mdSidenav', '$location', 'auth', 'store', '$mdMedia',
            function($mdSidenav, $location, auth, store, $mdMedia){
                return {
                    templateUrl: global.APP_DIR + '/directives/toolbar/toolbar.html',
                    restrict: 'EA',
                    replace: true,
                    scope: {},
                    link: function($scope, $element, $attrs, $controllers){

                        $scope.$mdSidenav = $mdSidenav;
                        $scope.path = $location.$$path.split("/")[1];
                        $scope.auth = auth;
                        $scope.$location = $location;
                        $scope.isSmallDevice = $mdMedia('sm');
                        $scope.mobileSideMenuUrl = global.APP_DIR + '/directives/toolbar/mobile-side-menu.html';

                        function _redirectToLogin(){
                          $location.path(global.LOGIN_ROUTE);
                        }

                        function _redirectToStartView(){
                          $location.path(global.START_VIEW);
                        }

                        $scope.getButtonClass = function (menu) {
                            return {
                                'active': $scope.path == menu
                            };
                        };

                        $scope.goBack = function(){
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

                        $scope.logout = function () {
                            auth.signout();
                            store.remove('profile');
                            store.remove('token');
                            $.jStorage.flush();

                            if(global.REQUIRE_AUTHENTICATION){
                              _redirectToLogin();
                            }else{
                              _redirectToStartView();
                            }
                        };

                    }
                }
            }]);

})(window);
