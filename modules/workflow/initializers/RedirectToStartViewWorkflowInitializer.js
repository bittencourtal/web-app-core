(function (global) {

    function RedirectToStartViewWorkflowInitializer($q, $location, navigationService) {

        function _startViewIsEmpty() {
            return !global.APP_CONFIG.START_VIEW;
        }

        return {
            init: function () {
                var defer = $q.defer();

                if (navigationService.isRefresh() || _startViewIsEmpty()) {
                    defer.resolve();
                    return defer.promise;
                }

                $location.path(global.APP_CONFIG.START_VIEW);
                defer.resolve();
                return defer.promise;
            }
        };
    }
    RedirectToStartViewWorkflowInitializer.$inject = ['$q', '$location', 'navigationService'];
    var _factoryInjector = RedirectToStartViewWorkflowInitializer.$inject.concat(RedirectToStartViewWorkflowInitializer);
    global.squid.workflow.factory('RedirectToStartViewWorkflowInitializer', _factoryInjector);

})(window);