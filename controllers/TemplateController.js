(function (global) {
    "use strict";

    global.squid.app.controller('TemplateController', [
        '$scope',
        '$rootScope',
        'auth',
        '$location',
        '$mdMedia',
        'mdThemeColorsDSS',
        function ($scope,
                  $rootScope,
                  auth,
                  $location,
                  $mdMedia,
                  mdThemeColorsDSS) {

            $scope = $scope || {};
            $rootScope.pageTitle = "";
            $rootScope.secondaryNav = false;
            $rootScope.isSmallDevice = $mdMedia('sm');
            $scope.isLoading = false;
            $scope.viewUrl = "";
            $scope.auth = auth;
            $scope.$location = $location;
            $scope.path = $location.$$path.split("/")[1];
            $scope.toggleObject = {item: -1};
            $scope.APP_DIR = global.APP_DIR;

            $scope.scrollToUp = function(){
                $('html, body').animate({
                    scrollTop: 0
                }, 1500);
            };

            $scope.$on('$routeChangeStart', function() {
                $scope.isLoading = true;
                console.log('Start');
            });

            $scope.$on('$routeChangeError', function() {
                $scope.isLoading = false;
            });

            $scope.$on('$routeChangeSuccess', function (e, nextRoute) {
                $rootScope.pageTitle = nextRoute && nextRoute.$$route ? nextRoute.$$route.pageTitle : "";
                $scope.viewUrl = nextRoute && nextRoute.$$route ? nextRoute.$$route.viewUrl : "";
                $rootScope.secondaryNav = nextRoute && nextRoute.$$route ? nextRoute.$$route.secondaryNav : false;
                $scope.path = $location.$$path.split("/")[1];
                $scope.isLoading = false;

                if(nextRoute && nextRoute.$$route && nextRoute.$$route.requireLogin && !auth.isAuthenticated)
                    $location.path(global.START_VIEW);
            });

            mdThemeColorsDSS.init();
        }
    ]);

})(window);

