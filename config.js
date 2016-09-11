(function(global){


    function _initializeThemeColorFactory($mdThemingProvider, $provide){
        var colorStore = {};

        function _populateColorStore(){
            Object.keys($mdThemingProvider._PALETTES).forEach(
                function(palleteName) {
                    var pallete = $mdThemingProvider._PALETTES[palleteName];
                    var colors  = [];
                    colorStore[palleteName]=colors;
                    Object.keys(pallete).forEach(function(colorName) {
                        if (/#[0-9A-Fa-f]{6}|0-9A-Fa-f]{8}\b/.exec(pallete[colorName])) {
                            colors[colorName] = pallete[colorName];
                        }
                    });
                });
        }

        function _bindFactoryColorProvider(){
            $provide.factory('mdThemeColors', [
                function() {
                    var service = {};

                    var getColorFactory = function(intent){
                        return function(){
                            var colors = $mdThemingProvider._THEMES['default'].colors[intent];
                            var name = colors.name

                            if(!colorStore[name])
                                _populateColorStore();

                            // Append the colors with links like hue-1, etc
                            colorStore[name].default = colorStore[name][colors.hues['default']]
                            colorStore[name].hue1 = colorStore[name][colors.hues['hue-1']]
                            colorStore[name].hue2 = colorStore[name][colors.hues['hue-2']]
                            colorStore[name].hue3 = colorStore[name][colors.hues['hue-3']]
                            return colorStore[name];
                        }
                    }

                    /**
                     * Define the getter methods for accessing the colors
                     */
                    Object.defineProperty(service,'primary', {
                        get: getColorFactory('primary')
                    });

                    Object.defineProperty(service,'accent', {
                        get: getColorFactory('accent')
                    });

                    Object.defineProperty(service,'warn', {
                        get: getColorFactory('warn')
                    });

                    Object.defineProperty(service,'background', {
                        get: getColorFactory('background')
                    });

                    return service;
                }
            ]);
        }

        _populateColorStore();
        _bindFactoryColorProvider();
    }

    function _createClientPallete($mdThemingProvider){
        if(global.APP_CONFIG.THEME.CUSTOM){
            $mdThemingProvider.definePalette(global.APP_CONFIG.THEME.PRIMARY_COLOR.name, global.APP_CONFIG.THEME.PRIMARY_COLOR.value);
            $mdThemingProvider._PALETTES[global.APP_CONFIG.THEME.PRIMARY_COLOR.name] = global.APP_CONFIG.THEME.PRIMARY_COLOR.value;

            $mdThemingProvider.definePalette(global.APP_CONFIG.THEME.SECONDARY_COLOR.name, global.APP_CONFIG.THEME.SECONDARY_COLOR.value);
            $mdThemingProvider._PALETTES[global.APP_CONFIG.THEME.SECONDARY_COLOR.name] = global.APP_CONFIG.THEME.SECONDARY_COLOR.value;

            $mdThemingProvider.definePalette(global.APP_CONFIG.THEME.WARN_COLOR.name, global.APP_CONFIG.THEME.WARN_COLOR.value);
            $mdThemingProvider._PALETTES[global.APP_CONFIG.THEME.WARN_COLOR.name] = global.APP_CONFIG.THEME.WARN_COLOR.value;
        }

        $mdThemingProvider.theme('default')
            .primaryPalette(global.APP_CONFIG.THEME.PRIMARY_COLOR.name)
            .accentPalette(global.APP_CONFIG.THEME.SECONDARY_COLOR.name)
            .warnPalette(global.APP_CONFIG.THEME.WARN_COLOR.name);

    }

    global.squid.app.config(
        ['$httpProvider', 'authProvider', 'jwtInterceptorProvider', '$mdThemingProvider','$mdIconProvider', '$provide', '$compileProvider', '$sceProvider',
            function($httpProvider, authProvider, jwtInterceptorProvider, $mdThemingProvider, $mdIconProvider, $provide, $compileProvider, $sceProvider) {
                $httpProvider.defaults.useXDomain = true;
                delete $httpProvider.defaults.headers.common['X-Requested-With'];

                authProvider.init({
                    domain: global.APP_CONFIG.AUTH0.DOMAIN,
                    clientID: global.APP_CONFIG.AUTH0.CLIENT_ID,
                    loginUrl: global.APP_CONFIG.LOGIN_ROUTE
                });

                jwtInterceptorProvider.tokenGetter = function(store) { return store.get('token'); };
                $httpProvider.interceptors.push('jwtInterceptor');
                $httpProvider.interceptors.push('appIdInjector');
                $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension|whatsapp):/);
                $sceProvider.enabled(false);

                _createClientPallete($mdThemingProvider);
                _initializeThemeColorFactory($mdThemingProvider, $provide);
            }
        ]);

})(window);
