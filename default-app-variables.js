(function(global) {
    "use strict";

    function _getEndPointUrl() {
        var hostName = window.location.hostname;

        if (hostName === 'localhost') {
            return 'http://localhost:5003';
        } else if (hostName.indexOf('-dev') > -1) {
            return 'http://api.squidit.com.br:81';
        } else {
            return 'http://api.squidit.com.br';
        }
    }

    function _getAppId() {
        var hostName = window.location.hostname;

        if (hostName === 'localhost') {
            return global.SQUID_APP_ID;
        } else if (hostName.indexOf('-dev') > -1) {
            return global.SQUID_APP_ID;
        } else {
            return global.SQUID_APP_ID;
        }
    }

    moment.locale('pt-br');

    global.APP_DIR = '';
    global.VIEWS = {
        TEMPLATES: {
            DEFAULT: function() {
                return global.APP_DIR + '/views/templates/default.html'
            },
            LOGIN: function() {
                return global.APP_DIR + '/views/templates/login.html'
            }
        }
    };
    global.END_POINT_URL = _getEndPointUrl();
    global.SERVICES_END_POINT_URL = _getEndPointUrl();
    global.AUTH0_CLIENT_ID = 'xmwmLJ1KnUrU3vJVW1uNfvIb4TCpguVX';
    global.AUTH0_DOMAIN = 'squid.auth0.com';
    global.AUTH0_CALLBACK_URL = 'https://squid.auth0.com/login/callback';
    global.SQUID_APP_ID = '';
    global.START_VIEW = '/mission/actives';
    global.APP_ID = _getAppId();
    global.squid = {};
    global.squid.defaultDependencies = [
        'ngRoute',
        'ngResource',
        'auth0',
        'angular-storage',
        'angular-jwt',
        'ngMaterial',
        'mdThemeColorsDSS',
        'tagged.directives.infiniteScroll',
        'ngMask'
    ];
    global.THEME = {
        CUSTOM: true,
        PRIMARY_COLOR: {
            name: 'squid-red',
            value: {
                '50': '#f2abaa',
                '100': '#ef9594',
                '200': '#ec7f7e',
                '300': '#e96967',
                '400': '#e55351',
                '500': '#E23D3B',
                '600': '#df2725',
                '700': '#cc201e',
                '800': '#b61d1b',
                '900': '#9f1918',
                'A100': '#f6c1c0',
                'A200': '#f9d7d6',
                'A400': '#fceded',
                'A700': '#891614'
            }
        },
        SECONDARY_COLOR: {
            name: 'squid-gray',
            value: {
                '50': '#938b87',
                '100': '#877e79',
                '200': '#79726d',
                '300': '#6c6561',
                '400': '#5e5955',
                '500': '#514c49',
                '600': '#443f3d',
                '700': '#363331',
                '800': '#292625',
                '900': '#1b1a19',
                'A100': '#9f9894',
                'A200': '#aba5a2',
                'A400': '#b7b2af',
                'A700': '#0e0d0d'
            }
        },
        WARN_COLOR: {
            name: 'red',
            value: {
				'50': '#938b87',
                '100': '#877e79',
                '200': '#79726d',
                '300': '#6c6561',
                '400': '#5e5955',
                '500': '#514c49',
                '600': '#443f3d',
                '700': '#363331',
                '800': '#292625',
                '900': '#1b1a19',
                'A100': '#9f9894',
                'A200': '#aba5a2',
                'A400': '#b7b2af',
                'A700': '#0e0d0d'
			}
        }
    };

})(window);
