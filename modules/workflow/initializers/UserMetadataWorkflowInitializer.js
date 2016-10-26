(function (global) {

    var _userControllers = global.squid.user.controllers;

    function UserMetadataWorkflowInitializer($q, store, $mdDialog, userMetadataHelper) {

        function _requiredUserInfosFilled() {
            var userMetadata = userMetadataHelper.getUserMetadata();

            if (!userMetadata)
                return false;

            return global.APP_CONFIG.USER_METADATA.REQUIRED_INFOS.all(function (requiredInfo) {
                return !!userMetadata[requiredInfo];
            });
        }

        return {
            init: function () {
                var defer = $q.defer();

                if (_requiredUserInfosFilled()) {
                    defer.resolve();
                } else {
                    $mdDialog.show({
                        controller: _userControllers.UserMetadataDialogController,
                        templateUrl: global.APP_CONFIG.APP_DIR + '/modules/user/views/user-metadata-dialog.html',
                        parent: angular.element(document.body),
                        clickOutsideToClose: false,
                        escapeToClose: false
                    }).then(defer.resolve, defer.reject);
                }

                return defer.promise;
            }
        };
    }
    UserMetadataWorkflowInitializer.$inject = ['$q', 'store', '$mdDialog', 'userMetadataHelper'];
    var _factoryInjector = UserMetadataWorkflowInitializer.$inject.concat(UserMetadataWorkflowInitializer);
    global.squid.workflow.factory('UserMetadataWorkflowInitializer', _factoryInjector);

})(window);