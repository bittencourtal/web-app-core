(function (global) {
  "use strict"

  var toastConfig = {
    delay: 10000,
    close: 'OK'
  };

  function TermsOfUseDialogController($scope, $rootScope, $timeout, $location, store, $mdDialog, userService, $q, $mdToast, auth, squidSpidermanService) {
    $scope.isLoading = false;
    $scope.TERMS_OF_USE = global.APP_CONFIG.TERMS_OF_USE;

    function _getToastPosition() {
      if ($rootScope.isSmallDevice) {
        return 'bottom left';
      } else {
        return 'top right';
      }
    }

    function _getProfile() {
      return store.get('profile');
    }

    function _getUserMetadata() {
      var userProfile = _getProfile();

      if (!userProfile.user_metadata || !userProfile.user_metadata.infos)
        return null;

      return userProfile.user_metadata.infos.first(function (userMetadata) {
        return userMetadata.channelId == global.APP_CONFIG.APP_ID();
      });
    }

    function _updateUserMetadata(userMetadata) {
      var defer = $q.defer();

      squidSpidermanService.updateUserMetadata(userMetadata, defer.resolve, defer.reject);

      return defer.promise;
    }

    function _answerTerms(answer) {
      debugger;
      var userMetadata = _getUserMetadata();

      if (!userMetadata)
        userMetadata = {};

      userMetadata.acceptedTerms = answer;
      return _updateUserMetadata(userMetadata);
    }

    function _logout() {
      auth.signout();
      store.remove('profile');
      store.remove('token');
      $.jStorage.flush();
      $rootScope.$broadcast('refreshLogin');
      _redirectToLogin();
    }

    function _redirectToLogin() {
      $location.path(global.APP_CONFIG.LOGIN_ROUTE);
    }

    function _termsDisagreed() {
      var defer = $q.defer();

      _answerTerms(false)
        .then(defer.resolve, defer.reject);

      var toast = $mdToast.simple()
        .content('Para participar da(s) campanha(s) você deve concordar com o regulamento.')
        .action(toastConfig.close)
        .parent($('main').get(0))
        .hideDelay(toastConfig.delay)
        .highlightAction(false)
        .position(_getToastPosition());

      _logout();
      $timeout(function () {
        $mdToast.show(toast).then(function (result) {});
      }, 800);

      return defer.promise;
    }

    function _termsAgreed() {
      var defer = $q.defer();

      _answerTerms(true)
        .then(defer.resolve, defer.reject);

      return defer.promise;
    }

    function _closeModal() {
      $mdDialog.hide();
    }

    function _cancelModal() {
      $mdDialog.cancel();
    }

    function _stopLoadingAndCloseModal() {
      _closeModal();
      $scope.isLoading = false;
    }

    function _stopLoadingAndCancelModal() {
      _cancelModal();
      $scope.isLoading = false;
    }

    $scope.agree = function () {
      $scope.isLoading = true;
      _termsAgreed()
        .then(_stopLoadingAndCloseModal)
        .catch(_stopLoadingAndCancelModal);
    };

    $scope.disagree = function () {
      $scope.isLoading = true;
      _termsDisagreed()
        .then(_stopLoadingAndCloseModal)
        .catch(_stopLoadingAndCancelModal);
    };
  }

  global.squid.campaign.controllers.TermsOfUseDialogController = TermsOfUseDialogController;
  global.squid.campaign.controller('TermsOfUseDialogController', [
    '$scope',
    '$rootScope',
    '$timeout',
    '$location',
    'store',
    '$mdDialog',
    'userService',
    '$q',
    '$mdToast',
    'auth',
    'squidSpidermanService',
    TermsOfUseDialogController
  ]);

})(window);