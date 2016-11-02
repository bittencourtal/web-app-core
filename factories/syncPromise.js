(function (global) {
    "use strict";

    global.squid.app.factory('syncPromise', ['$q', function ($q) {
        return function (fn) {
            return function (previouPromiseResponse) {
                var defer = $q.defer();
                
                defer.resolve(fn(previouPromiseResponse));

                return defer.promise;
            }
        }
    }]);

})(window);