(function (global) {

    var _campaignControllers = global.squid.campaign.controllers;

    function TermsOfUseWorkflowInitializer($q, $mdDialog, TermsOfUseValidator) {
        return {
            init: function () {
                var defer = $q.defer();

                TermsOfUseValidator
                    .init()
                    .then(defer.resolve)
                    .catch(function () {
                        $mdDialog.show({
                            controller: _campaignControllers.TermsOfUseDialogController,
                            templateUrl: global.APP_CONFIG.APP_DIR + '/modules/campaign/views/terms-of-use-dialog.html',
                            parent: angular.element(document.body),
                            clickOutsideToClose: false,
                            escapeToClose: false
                        }).then(defer.resolve, defer.reject);
                    });

                return defer.promise;
            }
        };
    }
    TermsOfUseWorkflowInitializer.$inject = ['$q', '$mdDialog', 'TermsOfUseValidator'];
    global.squid.workflow.factory('TermsOfUseWorkflowInitializer', TermsOfUseWorkflowInitializer);

})(window);