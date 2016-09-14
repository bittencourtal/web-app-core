(function (global) {
    "use strict";

    global.squid.mission.controller('ActiveMissionController', [
        '$scope', 'feedService', '$mdToast', 'uniqueCampaignService',
        function ($scope, feedService, $mdToast, uniqueCampaignService) {

            $scope.feedList = [];
            $scope.paginationMetadata = {};
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

            function _loadFeed(minId) {
                var query = {};

                if (minId)
                    query.minId = minId;

                $scope.isLoading = true;

                feedService.getMissionsActive(query, function (result) {
                    $scope.feedList = $scope.feedList.concat(result.data);
                    $scope.paginationMetadata = result.paginationMetadata;
                    $scope.isLoading = false;
                }, function (err) {
                    $scope.isLoading = false;
                });
            }

            function _init() {
                if (APP_CONFIG.CAMPAIGNS.UNIQUE_CAMPAIGN.IS_UNIQUE)
                    _redirectToUniqueMission()
                else
                    _loadFeed();
            }

            $scope.loadMore = function () {
                if ($scope.isLoading || !$scope.paginationMetadata.next)
                    return;

                _loadFeed($scope.paginationMetadata.next.minId);
            };

            _init();
        }]);

})(window);