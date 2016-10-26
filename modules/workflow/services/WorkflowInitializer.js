(function(global){

    function WorkflowInitializer($q, $injector){

        this.initWorkflows = function(workflows){
            var defer = $q.defer();

            function _processWorkflowsInitializers(){
                var workflowInitializers = arguments;
                
                async.eachSeries(workflowInitializers, function(workflowInitializer, callback){
                    workflowInitializer.init().then(function(result){
                        callback(null);
                    }).catch(callback)
                }, function(err){
                    if(err)
                        return defer.reject(err);

                    defer.resolve();
                })
            }
            _processWorkflowsInitializers.$inject = workflows;
            $injector.invoke(_processWorkflowsInitializers); 

            return defer.promise;
        };
    }

    global.squid.workflow.factory('WorkflowInitializer', ['$q', '$injector', function($q, $injector){
        return new WorkflowInitializer($q, $injector);
    }]);

})(window);