(function(global){
    "use strict";

    global.squid.campaign.controller('CampaignRankController', [
        '$scope', 'campaignServicePtBr', '$routeParams', '$q', '$mdMedia',
        function($scope, campaignService, $routeParams, $q, $mdMedia){

        $scope.isLoading = false;
        $scope.campaignRank = [];
        $scope.isSmallDevice = $mdMedia('sm');

        function _getCampaignRank(){
            var defer = $q.defer();

            campaignService.getRank({
                idCampaign: $routeParams.campaignId
            }, defer.resolve, defer.reject);

            return defer.promise;
        }

        function _populateCampaign(rank){
            $scope.campaignRank = rank;
        }

        function _showLoader(){
            $scope.isLoading = true;
        }

        function _hideLoader(){
            $scope.isLoading = false;
        }

        function _init(){
            _showLoader();
            _getCampaignRank()
                .then(_populateCampaign)
                .then(_hideLoader);
        }

        _init();
    }]);

})(window);