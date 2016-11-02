(function (global) {
    "use strict";

    var toastConfig = {
        delay: 10000,
        close: 'OK'
    };

    global.squid.user.directive('userMetadataForm', [
        'addressService',
        '$q',
        '$rootScope',
        '$mdToast',
        'syncPromise',
        'squidSpidermanService',
        function (
            addressService,
            $q,
            $rootScope,
            $mdToast,
            syncPromise,
            squidSpidermanService
        ) {
            return {
                scope: {
                    ngModel: '=',
                    isSaving: '=',
                    save: '='
                },
                templateUrl: global.APP_CONFIG.APP_DIR + '/modules/user/directives/user-metadata-form/user-metadata-form.html',
                link: function ($scope, $element, $attrs, $controller) {

                    $scope.isLoading = false;
                    $scope.states = [
                        'AC', 'AL', 'AP', 'AM',
                        'BA', 'CE', 'DF', 'ES',
                        'GO', 'MA', 'MT', 'MS',
                        'MG', 'PA', 'PB', 'PR',
                        'PE', 'PI', 'RJ', 'RN',
                        'RS', 'RO', 'RR', 'SC',
                        'SP', 'SE', 'TO'
                    ];

                    function _getToastPosition() {
                        if ($rootScope.isSmallDevice) {
                            return 'bottom left';
                        } else {
                            return 'top right';
                        }
                    }

                    function _getAddressByCep(cep) {
                        var defer = $q.defer();

                        if (!cep) {
                            defer.reject();
                            return defer.promise;
                        }

                        addressService.get({
                            cep: cep
                        }, defer.resolve, defer.reject);

                        return defer.promise;
                    }

                    function _getAddress(addressMetadata) {
                        return !!addressMetadata.logradouro ?
                            addressMetadata.logradouro + ', ' + addressMetadata.complemento + ', ' + addressMetadata.bairro :
                            '';
                    }

                    function _populateCep(addressMetadata) {
                        $scope.ngModel.state = addressMetadata.uf;
                        $scope.ngModel.city = addressMetadata.localidade;
                        $scope.ngModel.address = _getAddress(addressMetadata);
                    }

                    function _getUserMetadata() {
                        var defer = $q.defer();
                        squidSpidermanService.getUserMetadata(defer.resolve, defer.reject);
                        return defer.promise;
                    }

                    function _populateUserMetadata(userMetadata) {
                        delete userMetadata.$promise;
                        delete userMetadata.$resolved;
                        userMetadata.birthday = moment(userMetadata.birthday)._d;
                        $scope.ngModel = userMetadata;
                    }

                    function _updateUserMetadata(metadata) {
                        var defer = $q.defer();
                        squidSpidermanService.updateUserMetadata(metadata, defer.resolve, defer.reject);
                        return defer.promise;
                    }

                    function _showLoader() {
                        $scope.isLoading = true;
                    }

                    function _hideLoader() {
                        $scope.isLoading = false;
                    }

                    function _showMessage(message) {
                        var toast = $mdToast.simple()
                            .content(message)
                            .action(toastConfig.close)
                            .parent($('main').get(0))
                            .hideDelay(toastConfig.delay)
                            .highlightAction(false)
                            .position(_getToastPosition());

                        $mdToast.show(toast).then(function (response) {});
                    }

                    function _validateUserMetadata(userMetadata) {
                        var hasAnyUnfilledRequiredField = global.APP_CONFIG.CHECKOUT.REQUIRED_INFOS.any(function (field) {
                            return !userMetadata[field];
                        });

                        if (hasAnyUnfilledRequiredField)
                            _showMessage('Preencha os campos obrigatórios.');

                        return !hasAnyUnfilledRequiredField;
                    }

                    function _interUserMetadataSaved(result){
                        $scope.isSaving = false;
                        return result;
                    }

                    function _interUserMetadataNotSaved(defer){
                        return function(error){
                            $scope.isSaving = false;
                            defer.reject(error);
                        }
                    }

                    function _init() {
                        _showLoader();
                        _getUserMetadata()
                            .then(syncPromise(_populateUserMetadata))
                            .then(_hideLoader);
                    }

                    $scope.save = function () {
                        var defer = $q.defer();

                        if (!_validateUserMetadata($scope.ngModel)) {
                            defer.reject();
                            return defer.promise;
                        }

                        _showLoader();
                        $scope.isSaving = true;
                        _updateUserMetadata($scope.ngModel)
                            .then(syncPromise(_hideLoader))
                            .then(syncPromise(_interUserMetadataSaved))
                            .then(defer.resolve)
                            .catch(_interUserMetadataNotSaved(defer));

                        return defer.promise;
                    };

                    $scope.tryGetCep = function (cep) {
                        if (cep.length < 8)
                            return;

                        _getAddressByCep(cep)
                            .then(syncPromise(_populateCep));
                    };

                    _init();
                }
            };
        }
    ]);


})(window);