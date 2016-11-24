(function (global) {

    function RedirectToUniqueCampaignWorkflowInitializer($q, $location, uniqueCampaignService) {

        return {
            init: function () {
                return uniqueCampaignService.getUniqueCampaign()
                    .then(uniqueCampaignService.redirectToUniqueCampaign)
                    .catch(uniqueCampaignService.notifyNotHaveCampaign);
            }
        };
    }
    RedirectToUniqueCampaignWorkflowInitializer.$inject = ['$q', '$location', 'uniqueCampaignService'];
    var _factoryInjector = RedirectToUniqueCampaignWorkflowInitializer.$inject.concat(RedirectToUniqueCampaignWorkflowInitializer);
    global.squid.workflow.factory('RedirectToUniqueCampaignWorkflowInitializer', _factoryInjector);

})(window);