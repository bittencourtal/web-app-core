(function(global){

    var toastConfig = {
        delay: 10000,
        close: 'OK'
    };

    function TermsDialogController($scope, $mdDialog){

        $scope.currentStep = 'campanha';

        $scope.next = function(){
            $scope.currentStep = 'regulamento';
        };

        $scope.back = function(){
            $scope.currentStep = 'campanha';
        };

        $scope.cancel = function(){
            $mdDialog.cancel();
        };

        $scope.ok = function(){
            $mdDialog.hide(true);
        }
    }

    global.squid.login.controller('TermsDialogController', ['$scope', '$mdDialog', TermsDialogController]);

    global.squid.login.factory('TermsDialogService',
        ['$rootScope', '$q', '$mdDialog', '$mdToast', 'userService', 'store',
            function($rootScope, $q, $mdDialog, $mdToast, userService, store){

                function _getToastPosition(){
                    if($rootScope.isSmallDevice){
                        return 'bottom left';
                    }else{
                        return 'top right';
                    }
                }

                function _updateUserMetadata(profile){
                    var defer = $q.defer();

                    userService.update(profile.app_metadata, function(response){
                        defer.resolve(profile);
                    }, function(err){
                        defer.reject(profile);
                    });

                    return defer.promise;
                }

                function _termsNotAccepted(profile){
                    var defer = $q.defer();

                    profile.app_metadata = (!!profile.app_metadata) ? profile.app_metadata : {};
                    profile.app_metadata.acceptedTerms = false;
                    store.set('profile', profile);

                    var toast = $mdToast.simple()
                        .content('Você deve aceitar os termos de uso para poder navegar.')
                        .action(toastConfig.close)
                        .parent($('main').get(0))
                        .hideDelay(toastConfig.delay)
                        .highlightAction(false)
                        .position(_getToastPosition());

                    $mdToast.show(toast).then(function(response) {});

                    _updateUserMetadata(profile)
                        .then(defer.resolve, defer.reject);

                    return defer.promise;
                }

                function _termsAccepted(acceptTerms, profile){
                    var defer = $q.defer();

                    profile.app_metadata = (!!profile.app_metadata) ? profile.app_metadata : {};
                    profile.app_metadata.acceptedTerms = acceptTerms;
                    store.set('profile', profile);

                    _updateUserMetadata(profile)
                        .then(defer.resolve, defer.reject);

                    return defer.promise;
                }

                return {
                    openDialog: function(profile){
                        var defer = $q.defer();

                        $mdDialog.show({
                                controller: TermsDialogController,
                                templateUrl: global.APP_CONFIG.APP_DIR + '/modules/login/views/term-dialog.html',
                                parent: angular.element(document.body),
                                clickOutsideToClose: true
                            })
                            .then(function(acceptTerms) {
                                _termsAccepted(acceptTerms, profile)
                                    .then(defer.resolve, defer.reject);
                            }, function() {
                                _termsNotAccepted(profile)
                                    .then(defer.reject, defer.reject);
                            });

                        return defer.promise;
                    }
                }
            }]);

})(window);