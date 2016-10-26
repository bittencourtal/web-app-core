(function (global) {

    var _campaignControllers = global.squid.campaign.controllers;

    function AboutCampaignWorkflowInitializer($q, store, $mdDialog) {

        return {
            init: function () {
                var defer = $q.defer();

                var _aboutCampaignRead = store.get('about-campaign-read');
                if (_aboutCampaignRead) {
                    defer.resolve();
                } else {
                    $mdDialog.show({
                        controller: _campaignControllers.AboutCampaignDialogController,
                        templateUrl: global.APP_CONFIG.APP_DIR + '/modules/campaign/views/about-campaign-dialog.html',
                        parent: angular.element(document.body),
                        clickOutsideToClose: false,
                        escapeToClose: false
                    }).then(defer.resolve, defer.reject);
                }

                return defer.promise;
            }
        };
    }
    AboutCampaignWorkflowInitializer.$inject = ['$q', 'store', '$mdDialog'];
    var _factoryInjector = AboutCampaignWorkflowInitializer.$inject.concat(AboutCampaignWorkflowInitializer);
    global.squid.workflow.factory('AboutCampaignWorkflowInitializer', _factoryInjector);

})(window);