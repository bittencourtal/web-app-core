(function (global) {

    function RedirectToStartViewWorkflowInitializer($q, $location) {

        return {
            init: function () {
                var defer = $q.defer();

                $location.path(global.APP_CONFIG.START_VIEW);
                
                defer.resolve();
                return defer.promise;
            }
        };
    }
    RedirectToStartViewWorkflowInitializer.$inject = ['$q', '$location'];
    var _factoryInjector = RedirectToStartViewWorkflowInitializer.$inject.concat(RedirectToStartViewWorkflowInitializer);
    global.squid.workflow.factory('RedirectToStartViewWorkflowInitializer', _factoryInjector);

})(window);