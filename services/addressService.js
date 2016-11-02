(function(global){
    "use strict";

    global.squid.app.factory('addressService', ['$resource', function($resource){
        return $resource('https://viacep.com.br/ws/:cep/json/', {
            cep: '@cep'
        });
    }]);

})(window);