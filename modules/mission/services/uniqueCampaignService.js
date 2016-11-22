(function (global) {
    "use strict";

    var toastConfig = {
        delay: 10000,
        close: 'OK'
    };

    global.squid.mission.factory('uniqueCampaignService', [
        '$rootScope', '$mdToast', '$q', '$location', 'channelService',
        function ($rootScope, $mdToast, $q, $location, channelService) {

            function _getToastPosition() {
                if ($rootScope.isSmallDevice) {
                    return 'bottom left';
                } else {
                    return 'top right';
                }
            }

            function _notifyNotHaveCampaign() {
                var toast = $mdToast.simple()
                    .content('Não há campanha cadastrada no momento.')
                    .action(toastConfig.close)
                    .parent($('main').get(0))
                    .hideDelay(toastConfig.delay)
                    .highlightAction(false)
                    .position(_getToastPosition());

                $mdToast.show(toast).then(function (response) {});
            }

            function _getUniqueCampaign() {
                var defer = $q.defer();

                channelService.getActiveCampaigns({}, function (campaigns) {
                    if (!campaigns)
                        return defer.reject();
                        
                    var campaign = campaigns.first();

                    if (!campaign)
                        return defer.reject();

                    defer.resolve(campaign);
                }, defer.reject);

                return defer.promise;
            }

            function _redirectToUniqueCampaign(campaign) {
                $location.path('mission/mission-details/' + campaign._id);
            }

            function _redirectToUniqueCampaignRank(campaign){
                $location.path('campaign/rank/' + campaign._id);
            }

            return {
                getUniqueCampaign: _getUniqueCampaign,
                notifyNotHaveCampaign: _notifyNotHaveCampaign,
                redirectToUniqueCampaign: _redirectToUniqueCampaign,
                redirectToUniqueCampaignRank: _redirectToUniqueCampaignRank
            };
        }
    ]);

})(window);