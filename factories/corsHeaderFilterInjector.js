(function (global) {

    global.squid.app.factory('corsHeaderFilterInjector', [function () {

        function _isRequestForSquidApi(url) {
            return url.startsWith(global.APP_CONFIG.END_POINT_URL()) ||
                url.startsWith(global.APP_CONFIG.CAMPAIGN_END_POINT_URL()) ||
                url.startsWith(global.APP_CONFIG.SPIDERMAN_END_POINT_URL());
        }

        return {
            request: function (config) {
                if (_isRequestForSquidApi(config.url))
                    return config;

                delete config.headers.app_id;
                delete config.headers.Authorization;
                return config;
            }
        };
    }]);

})(window);