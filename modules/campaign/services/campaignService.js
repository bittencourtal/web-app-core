(function (global) {
    "use strict";

    global.squid.campaign.factory('campaignService', ['$resource', function ($resource) {
        return $resource(global.APP_CONFIG.CAMPAIGN_END_POINT_URL() + '/campaigns/:idCampaign/:resource/:resourceId/:action', {
            idCampaign: '@idCampaign',
            resource: '@resource',
            resourceId: '@resourceId',
            action: '@action'
        }, {
            checkoutPrize: {
                method: 'POST',
                params: {
                    resource: 'prizes',
                    action: 'checkout'
                }
            },
            getRank: {
                params: {
                    resource: 'pontuacao'
                },
                isArray: true
            },
            getCampaignPrizes: {
                method: 'GET',
                params: {
                    resource: 'prizes'
                }
            },
            getCampaign: {
                method: 'GET'
            }
        });
    }]);

    global.squid.campaign.factory('campaignServicePtBr', ['$resource', function ($resource) {
        return $resource(global.APP_CONFIG.CAMPAIGN_END_POINT_URL() + '/campanha/:idCampaign/:resource/:resourceId/:action', {
            idCampaign: '@idCampaign',
            resource: '@resource',
            resourceId: '@resourceId',
            action: '@action'
        }, {
            getRank: {
                params: {
                    resource: 'pontuacao'
                },
                isArray: true
            }
        });
    }]);

})(window);