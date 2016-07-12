/* jshint undef: true, unused: false */
/* global app, window */

(function (global) {

    global.squid.login.controller('LoginController', [
        '$scope', 'auth', '$location', 'store',
        function ($scope, auth, $location, store) {

            var dict = {
                loadingTitle: 'carregando...',
                close: 'fechar',
                signin: {
                    wrongEmailPasswordErrorText: 'E-mail ou senha inválidos.',
                    serverErrorText: 'Você não está autorizado.',
                    strategyEmailInvalid: 'O e-mail é invalido.',
                    strategyDomainInvalid: 'O domínio {domain} não foi configurado.'
                },
                signup: {
                    serverErrorText: 'Não foi possível se cadastrar.'
                },
                reset: {
                    serverErrorText: 'Não foi possível resetar a senha.'
                }
            };

            function _initAuthLockComponent() {
                auth.config.auth0lib.$container = null;
                auth.signin({
                        connections: ['instagram'],
                        container: 'login-box',
                        dict: dict
                    }, function (profile, token) {
                        store.set('profile', profile);
                        store.set('token', token);

                        if (_containsAllData(profile))
                            $location.path(global.START_VIEW);
                        else
                            $location.path('/register');
                    }
                    ,
                    function (error) {

                    }
                )
                ;
            }

            function _containsAllData(profile) {
                return profile.birthDate && profile.gender;
            }

            function _redirectIfIsLoggedIn() {
                if (auth.isAuthenticated)
                    $location.path(global.START_VIEW);
            }

            _redirectIfIsLoggedIn();
            _initAuthLockComponent();

        }

    ])
    ;

})(window);
