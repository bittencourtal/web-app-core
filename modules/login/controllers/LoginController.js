/* jshint undef: true, unused: false */
/* global app, window */

(function (global) {

    var toastConfig = {
        delay: 10000,
        close: 'OK'
    };

    var _campaignControllers = global.squid.campaign.controllers;
    var _loginControllers = global.squid.login.controllers;

    global.squid.login.controller('LoginController', [
        '$scope', '$rootScope', 'auth', '$location', 'store', '$mdDialog', '$mdToast', '$q', 'userService', 'WorkflowInitializer',
        function ($scope, $rootScope, auth, $location, store, $mdDialog, $mdToast, $q, userService, WorkflowInitializer) {
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
                $location.path(global.APP_CONFIG.LOGIN_ROUTE);
            }

            function _redirectToStartView() {
                $location.path(global.APP_CONFIG.START_VIEW);
            }

            function _redirectOnSuccessLogin(profile) {
                if (_containsAllData(profile))
                    _redirectToStartView();
                else
                    $location.path('/register');
            }

            function _redirectIfIsLoggedIn() {
                var defer = $q.defer();

                if (!auth.isAuthenticated) {
                    defer.resolve();
                    return defer.promise;;
                }

                _loggedIn()
                    .then(function () {
                        _redirectToStartView();
                        defer.resolve();
                    }, defer.reject);

                return defer.promise;
            }

            function _containsAllData(profile) {
                if (!profile)
                    return;

                return profile.birthDate && profile.gender;
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

            function _initWorkflow(){
                return WorkflowInitializer
                    .initWorkflows(global.APP_CONFIG.WORKFLOWS.LOGIN.AFTER);
            }

            function _loggedIn() {
                return _showLoader()
                        .then(_initWorkflow)
                        .then(_hideLoader);
            }

            function _initAuthLockComponent() {
                $scope.isLoading = false;
                auth.config.auth0lib.$container = null;
                auth.signin({
                    connections: ['instagram'],
                    container: 'login-box',
                    icon: '../images/logo.png',
                    dict: dict
                }, function (profile, token) {
                    store.set('profile', profile);
                    store.set('token', token);
                    _loggedIn()
                        .then(_redirectToStartView);
                }, function (error) {

                });
            }

            _redirectIfIsLoggedIn()
                .then(_initAuthLockComponent);

            $rootScope.$on('refreshLogin', _initAuthLockComponent);
        }
    ]);
})(window);