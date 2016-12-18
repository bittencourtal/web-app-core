(function (global) {
    "use strict";

    global.squid.app.factory('navigationService', ['$resource', function ($resource) {
        return {
            isRefresh: function () {
                if(!window.performance)
                    return false;

                var navigation = window.performance.navigation;
                return navigation.type == navigation.TYPE_RELOAD;
            }
        };
    }]);

})(window);