(function (global) {
	"use strict";

	moment.locale('pt-br');

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
			return global.APP_CONFIG.SQUID_APP_ID;
		} else if (hostName.indexOf('-dev') > -1) {
			return global.APP_CONFIG.SQUID_APP_ID;
		} else {
			return global.APP_CONFIG.SQUID_APP_ID;
		}
	}

	global.APP_CONFIG = {
		APP_DIR: '',
		VIEWS: {
			TEMPLATES: {
				DEFAULT: function () { return APP_CONFIG.APP_DIR + '/views/templates/default.html' },
				LOGIN: function () { return APP_CONFIG.APP_DIR + '/views/templates/login.html' }
			}
		},
		ABOUT_CAMPAIGN: {
			SHOW: true,
			TEXTS: {
				STEP_1: '<p>APP_CONFIG.ABOUT_CAMPAIGN.TEXTS.STEP_1<p>',
				STEP_2: '<p>APP_CONFIG.ABOUT_CAMPAIGN.TEXTS.STEP_2</p>'
			}
		},
		TERMS_OF_USE: {
			SHOW: true,
			LINK: 'https://drive.google.com/file/d/0BzGcM7wAXRLFOERBcHhlWkhZaE0/view',
		},
		PRIVACY_POLICY: {
			SHOW: true,
			LINK: 'https://drive.google.com/file/d/0BzGcM7wAXRLFSnZYVjdoY0pOWUk/view'
		},
		END_POINT_URL: _getEndPointUrl,
		SERVICES_END_POINT_URL: _getEndPointUrl,
		AUTH0: {
			CLIENT_ID: 'xmwmLJ1KnUrU3vJVW1uNfvIb4TCpguVX',
			DOMAIN: 'squid.auth0.com',
			CALLBACK_URL: 'https://squid.auth0.com/login/callback'
		},
		SQUID_APP_ID: 'e2a61aa025a94de7908ee1a13abe7c54',
		START_VIEW: '/checkout',
		LOGIN_ROUTE: '/login',
		REQUIRE_AUTHENTICATION: true,
		APP_ID: _getAppId,
		THEME: {
			CUSTOM: false,
			PRIMARY_COLOR: {
				name: 'deep-orange',
				value: {}
			},
			SECONDARY_COLOR: {
				name: 'red',
				value: {}
			},
			WARN_COLOR: {
				name: 'red',
				value: {}
			}
		}
	};

	global.squid = {
		defaultDependencies: [
			'ngRoute',
			'ngResource',
			'auth0',
			'angular-storage',
			'angular-jwt',
			'ngMaterial',
			'mdThemeColorsDSS',
			'tagged.directives.infiniteScroll',
			'ngMask'
		]
	};

})(window);
