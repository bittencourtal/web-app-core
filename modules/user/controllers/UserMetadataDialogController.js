(function (global) {

    var toastConfig = {
        delay: 10000,
        close: 'OK'
    };

    function UserMetadataDialogController($scope, $rootScope, $mdDialog, $mdToast, squidSpidermanService, userMetadataHelper) {

        var EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
        $scope.isLoading = false;
        $scope.userMetadata = userMetadataHelper.getUserMetadata() || {};

        function _getToastPosition() {
            if ($rootScope.isSmallDevice) {
                return 'bottom left';
            } else {
                return 'top right';
            }
        }

        function _isValidEmail(email) {
            return EMAIL_REGEX.test(email);
        }

        function _metadataUpdated() {
            $scope.isLoading = false;
            $mdDialog.hide();
        }

        function _metadataNotUpdated() {
            $scope.isLoading = false;
            var toast = $mdToast.simple()
                .content('Não foi possível salvar os dados, contate o administrador.')
                .action(toastConfig.close)
                .parent($('main').get(0))
                .hideDelay(toastConfig.delay)
                .highlightAction(false)
                .position(_getToastPosition());

            $mdToast.show(toast);
        }

        function _invalidEmail() {
            var toast = $mdToast.simple()
                .content('Insira um e-mail válido.')
                .action(toastConfig.close)
                .parent($('main').get(0))
                .hideDelay(toastConfig.delay)
                .highlightAction(false)
                .position(_getToastPosition());

            $mdToast.show(toast);
        }

        $scope.save = function (userMetadata) {
            if (!_isValidEmail(userMetadata.email))
                return _invalidEmail();

            $scope.isLoading = true;
            squidSpidermanService
                .updateUserMetadata(userMetadata, _metadataUpdated, _metadataNotUpdated);
        };

    }

    global.squid.user.controllers.UserMetadataDialogController = UserMetadataDialogController;
    global.squid.user.controller('UserMetadataDialogController', [
        '$scope',
        '$rootScope',
        '$mdDialog',
        '$mdToast',
        'squidSpidermanService',
        'userMetadataHelper',
        UserMetadataDialogController
    ]);

})(window);