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
        if(global.THEME.CUSTOM){
            $mdThemingProvider.definePalette(global.THEME.PRIMARY_COLOR.name, global.THEME.PRIMARY_COLOR.value);
            $mdThemingProvider._PALETTES[global.THEME.PRIMARY_COLOR.name] = global.THEME.PRIMARY_COLOR.value;

            $mdThemingProvider.definePalette(global.THEME.SECONDARY_COLOR.name, global.THEME.SECONDARY_COLOR.value);
            $mdThemingProvider._PALETTES[global.THEME.SECONDARY_COLOR.name] = global.THEME.SECONDARY_COLOR.value;
        }

        $mdThemingProvider.theme('default')
            .primaryPalette(global.THEME.PRIMARY_COLOR.name)
            .accentPalette(global.THEME.SECONDARY_COLOR.name);
    }

    global.squid.app.config(
        ['$httpProvider', 'authProvider', 'jwtInterceptorProvider', '$mdThemingProvider','$mdIconProvider', '$provide', '$compileProvider',
            function($httpProvider, authProvider, jwtInterceptorProvider, $mdThemingProvider, $mdIconProvider, $provide, $compileProvider) {
                $httpProvider.defaults.useXDomain = true;
                delete $httpProvider.defaults.headers.common['X-Requested-With'];

                authProvider.init({
                    domain: AUTH0_DOMAIN,
                    clientID: AUTH0_CLIENT_ID,
                    loginUrl: '/login'
                });

                jwtInterceptorProvider.tokenGetter = function(store) { return store.get('token'); };
                $httpProvider.interceptors.push('jwtInterceptor');
                $httpProvider.interceptors.push('appIdInjector');
                $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension|whatsapp):/);

                _createClientPallete($mdThemingProvider);
                _initializeThemeColorFactory($mdThemingProvider, $provide);
            }
        ]);

})(window);