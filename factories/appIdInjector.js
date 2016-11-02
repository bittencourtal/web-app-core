(function (global) {

    global.squid.app.factory('appIdInjector', [function () {
        return {
            request: function (config) {
                config.headers['app_id'] = global.APP_CONFIG.APP_ID();
                return config;
            }
        };
    }]);

})(window);