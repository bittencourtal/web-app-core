(function (global) {

    function RedirectToUniqueCampaignWorkflowInitializer($q, $location, navigationService, uniqueCampaignService, RedirectToStartViewWorkflowInitializer) {

        function _notHaveUniqueCampaign() {
            RedirectToStartViewWorkflowInitializer.init();
            uniqueCampaignService.notifyNotHaveCampaign();
        }

        return {
            init: function () {
                var defer = $q.defer();

                if (navigationService.isRefresh()) {
                    defer.resolve();
                    return defer.promise;
                }

                return uniqueCampaignService.getUniqueCampaign()
                    .then(uniqueCampaignService.redirectToUniqueCampaign)
                    .catch(_notHaveUniqueCampaign);
            }
        };
    }
    RedirectToUniqueCampaignWorkflowInitializer.$inject = ['$q', '$location', 'navigationService', 'uniqueCampaignService', 'RedirectToStartViewWorkflowInitializer'];
    var _factoryInjector = RedirectToUniqueCampaignWorkflowInitializer.$inject.concat(RedirectToUniqueCampaignWorkflowInitializer);
    global.squid.workflow.factory('RedirectToUniqueCampaignWorkflowInitializer', _factoryInjector);

})(window);