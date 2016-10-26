(function (global) {

    function TermsOfUseValidator($q, store, userMetadataHelper) {

        return {
            init: function () {
                var defer = $q.defer();

                userMetadataHelper.termsIsAccepted() 
                    ? defer.resolve()
                    : defer.reject();

                return defer.promise;
            }
        };
    }
    TermsOfUseValidator.$inject = ['$q', 'store', 'userMetadataHelper'];
    var _factoryInjector = TermsOfUseValidator.$inject.concat(TermsOfUseValidator);
    global.squid.workflow.factory('TermsOfUseValidator', _factoryInjector);

})(window);