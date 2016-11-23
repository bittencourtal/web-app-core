(function (global) {

    function AboutCampaignWorkflowInitializer($q, store, $mdDialog, AboutCampaignModalService) {

        return {
            init: function () {
                var defer = $q.defer();

                if (!AboutCampaignModalService.aboutCampaignIsRead())
                    return AboutCampaignModalService.openDialog();
                
                defer.resolve();
                return defer.promise;
            }
        };
    }
    AboutCampaignWorkflowInitializer.$inject = ['$q', 'store', '$mdDialog', 'AboutCampaignModalService'];
    var _factoryInjector = AboutCampaignWorkflowInitializer.$inject.concat(AboutCampaignWorkflowInitializer);
    global.squid.workflow.factory('AboutCampaignWorkflowInitializer', _factoryInjector);

})(window);