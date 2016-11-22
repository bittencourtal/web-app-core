(function (global) {
    "use strict";

    global.squid.mission.controller('ActiveMissionController', [
        '$scope', 'channelService', '$mdToast', 'uniqueCampaignService',
        function ($scope, channelService, $mdToast, uniqueCampaignService) {
            $scope.campaigns = [];
            $scope.isLoading = false;

            function _redirectToUniqueMission() {
                $scope.isLoading = true;

                uniqueCampaignService.getUniqueCampaign()
                    .then(function (campaign) {
                        uniqueCampaignService.redirectToUniqueCampaign(campaign);
                        $scope.isLoading = false;
                    })
                    .catch(function () {
                        uniqueCampaignService.notifyNotHaveCampaign();
                        $scope.isLoading = false;
                    });
            }

            function _loadCampaigns() {
                $scope.isLoading = true;

                channelService.getActiveCampaigns({})
                    .$promise
                    .then(function (result) {
                        $scope.campaigns = result;
                        $scope.isLoading = false;
                    })
                    .catch(function (err) {
                        $scope.isLoading = false;
                    });
            }

            function _init() {
                if (APP_CONFIG.CAMPAIGNS.UNIQUE_CAMPAIGN.IS_UNIQUE)
                    _redirectToUniqueMission();
                else
                    _loadCampaigns();
            }

            _init();
        }]);

})(window);