(function(global){
    "use strict";

    global.squid.app.factory('campaignService', ['$resource', function($resource){
        var channel = global.APP_CONFIG.APP_ID();
        var url = global.APP_CONFIG.CAMPAIGN_END_POINT_URL();
        return $resource(url + '/channels/' + channel + '/ranking', {
            channel: '@channel'
        }, {
            getRank: {
                method: 'GET',
                isArray: true
            }
        });
    }]);

})(window);