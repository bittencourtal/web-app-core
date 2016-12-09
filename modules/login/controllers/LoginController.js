/* jshint undef: true, unused: false */
/* global app, window */

(function (global) {

    var toastConfig = {
        delay: 10000,
        close: 'OK'
    };

    var _campaignControllers = global.squid.campaign.controllers;
    var _loginControllers = global.squid.login.controllers;
    var _isFirstTimeLogin = true;
    var $document = angular.element(document);

    global.squid.login.controller('LoginController', [
        '$scope', '$rootScope', 'auth', '$location', '$timeout', 'store', '$mdDialog', '$mdToast', '$q', 'userService', 'WorkflowInitializer',
        function ($scope, $rootScope, auth, $location, $timeout, store, $mdDialog, $mdToast, $q, userService, WorkflowInitializer) {
            $scope.isLoading = false;

            var dict = {
                loadingTitle: 'carregando...',
                close: 'fechar',
                signin: {
                    title: 'Seja bem-vindo!',
                    signinText: 'Entrar',
                    signupText: 'Cadastrar-se',
                    usernamePlaceholder: 'e-mail',
                    emailPlaceholder: 'e-mail',
                    passwordPlaceholder: "Senha",
                    separatorText: "ou",
                    wrongEmailPasswordErrorText: 'E-mail ou senha inválidos.',
                    serverErrorText: 'Você não está autorizado.',
                    strategyEmailInvalid: 'O e-mail é invalido.',
                    strategyDomainInvalid: 'O domínio {domain} não foi configurado.',
                    returnUserLabel: 'Da última vez você acessou como...',
                    all: 'Não é sua conta?',
                    forgotText: 'Esqueceu sua senha? Clique aqui.'
                },
                signup: {
                    serverErrorText: 'Não foi possível se cadastrar.'
                },
                reset: {
                    serverErrorText: 'Não foi possível resetar a senha.'
                }
            };

            function _logout() {
                auth.signout();
                store.remove('profile');
                store.remove('token');
                $.jStorage.flush();
                _hideLoader();
                _redirectToLogin();
            }

            function _redirectToLogin() {
                $timeout(function () {
                    $location.path(global.APP_CONFIG.LOGIN_ROUTE);
                }, 500);
            }

            function _redirectIfIsLoggedIn() {
                var defer = $q.defer();

                if (!auth.isAuthenticated) {
                    defer.resolve();
                    return defer.promise;;
                }

                _loggedIn()
                    .then(defer.resolve, defer.reject);

                return defer.promise;
            }

            function _hideLoader() {
                var defer = $q.defer();

                $scope.isLoading = false;
                defer.resolve();

                return defer.promise;
            }

            function _showLoader() {
                var defer = $q.defer();

                $scope.isLoading = true;
                defer.resolve();

                return defer.promise;
            }

            function _initWorkflow() {
                return WorkflowInitializer
                    .initWorkflows(global.APP_CONFIG.WORKFLOWS.LOGIN.AFTER);
            }

            function _loggedIn() {
                return _showLoader()
                    .then(_initWorkflow)
                    .then(_hideLoader);
            }

            function _initAsyncMode() {
                auth.signin({
                    connections: ['instagram'],
                    container: 'login-box',
                    icon: '../images/logo.png',
                    dict: dict
                }, function (profile, token) {
                    store.set('profile', profile);
                    store.set('token', token);
                    _loggedIn();
                }, function (error) {

                });
            }

            function _initRedirectMode() {
                auth.signin({
                    connections: ['instagram'],
                    container: 'login-box',
                    icon: '../images/logo.png',
                    dict: dict
                });
            }

            function _initAuthLockComponent() {
                $scope.isLoading = false;
                auth.config.auth0lib.$container = null;

                if (global.APP_CONFIG.USE_LOGIN_REDIRECT_MODE)
                    _initRedirectMode();
                else
                    _initAsyncMode();
            }

            _redirectIfIsLoggedIn()
                .then(_initAuthLockComponent);

            $rootScope.$on('refreshLogin', _initAuthLockComponent);
        }
    ]);

    function _configureEventsHandlersToRedirectMode() {
        global.squid.login.config(['authProvider', function (authProvider) {

            authProvider.on('loginSuccess', function ($location, profilePromise, idToken, store) {
                profilePromise.then(function (profile) {
                    store.set('profile', profile);
                    store.set('token', idToken);
                    $document.trigger('loggedIn');
                });
            });

            authProvider.on('authenticated', function ($location) {
                if(!_isFirstTimeLogin)
                    return;

                $document.trigger('loggedIn');
            });

            authProvider.on('loginFailure', function ($location, error) {

            });
        }]);

        global.squid.login.run(['WorkflowInitializer', function (WorkflowInitializer) {

            function _initWorkflow() {
                return WorkflowInitializer
                    .initWorkflows(global.APP_CONFIG.WORKFLOWS.LOGIN.AFTER);
            }

            $document.on('loggedIn', function(){
                _isFirstTimeLogin = false;
                _initWorkflow();
            });
        }])
    }

    if (global.APP_CONFIG.USE_LOGIN_REDIRECT_MODE)
        _configureEventsHandlersToRedirectMode();

})(window);