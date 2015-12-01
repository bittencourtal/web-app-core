(function(global){
    "use strict";

    global.squid.app.directive('toolbar',
        ['$mdSidenav', '$location', 'auth', 'store', '$mdMedia',
            function($mdSidenav, $location, auth, store, $mdMedia){
                return {
                    templateUrl: global.APP_DIR + '/directives/toolbar/toolbar.html',
                    restrict: 'EA',
                    replace: true,
                    link: function($scope, $element, $attrs, $controllers){

                        $scope.$mdSidenav = $mdSidenav;
                        $scope.path = $location.$$path.split("/")[1];
                        $scope.auth = auth;
                        $scope.$location = $location;
                        $scope.isSmallDevice = $mdMedia('sm');

                        $scope.getButtonClass = function (menu) {
                            return {
                                'active': $scope.path == menu
                            };
                        };

                        $scope.goBack = function(){
                            window.history.go(-1);
                        };

                        $scope.logout = function () {
                            auth.signout();
                            store.remove('profile');
                            store.remove('token');
                            $.jStorage.flush();
                        };

                    }
                }
            }]);

})(window);