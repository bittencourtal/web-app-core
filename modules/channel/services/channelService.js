(function(global){
    "use strict";

    global.squid.channel.factory('channelService', ['$resource', function($resource){
        return $resource(global.APP_CONFIG.CAMPAIGN_END_POINT_URL() + '/channels/:channelId/:resource/:resourceId/:action', {
                channelId: '@channelId',
                resource: '@resource',
                resourceId: '@resourceId',
                action: '@action'
            }, {
                getActiveCampaigns: {
                    method: 'GET',
                    params: {
                        resource: 'campaigns',
                        action: 'active'
                    },
                    isArray: true
                }
            });
    }]);

})(window);