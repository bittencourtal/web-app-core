(function(global, appConfig){
    "use strict";

    global.squid.channel.factory('channelService', ['$resource', function($resource){
        var channelId = appConfig.APP_ID();
        return $resource(appConfig.CAMPAIGN_END_POINT_URL() + '/channels/' + channelId + '/:resource/:resourceId/:action/:actionId', {
                resource: '@resource',
                resourceId: '@resourceId',
                action: '@action',
                actionId: '@actionId'
            }, {
                getActiveCampaigns: {
                    method: 'GET',
                    params: {
                        resource: 'campaigns',
                        action: 'active'
                    },
                    isArray: true
                },
                getCampaign: {
                   method: 'GET',
                    params: {
                        resource: 'campaigns'
                    } 
                },
                getCampaignPrizes: {
                    method: 'GET',
                    params: {
                        resource: 'campaigns',
                        action: 'prizes'
                    },
                    isArray: true
                },
                getSelfPoints: {
                    method: 'GET',
                    params: {
                        resource: 'self',
                        action: 'points',
                    },
                    isArray: true
                },
                createCheckout: {
                    method: 'POST',
                    url: appConfig.CAMPAIGN_END_POINT_URL() + '/channels/' + channelId + '/campaigns/:resourceId/prizes/:action/checkout'
                },
                getPrize: {
                    method: 'GET',
                    params: {
                        resource: 'campaigns',
                        action: 'prizes'
                    }
                }
            });
    }]);

})(window, window.APP_CONFIG);