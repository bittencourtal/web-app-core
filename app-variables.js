(function (global) {
	"use strict";

	function _getEndPointUrl() {
		var hostName = window.location.hostname;

		if (hostName === 'localhost') {
			return 'http://localhost:5003';
		} else if (hostName.contains('-dev')) {
			return 'http://api.squidit.com.br:81';
		}else {
			return 'http://api.squidit.com.br';
		}
	}

	function _getAppId(){
		var hostName = window.location.hostname;

		if (hostName === 'localhost') {
			return global.SQUID_APP_ID;
		} else if (hostName.contains('-dev')) {
			return global.SQUID_APP_ID;
		} else {
			return global.SQUID_APP_ID;
		}
	}

	moment.locale('pt-br');

	global.APP_DIR = '';
	global.VIEWS = {
		TEMPLATES: {
			DEFAULT: global.APP_DIR + '/views/templates/default.html'
		}
	};
	global.END_POINT_URL = _getEndPointUrl();
	global.SERVICES_END_POINT_URL = _getEndPointUrl();
	global.AUTH0_CLIENT_ID = 'xmwmLJ1KnUrU3vJVW1uNfvIb4TCpguVX';
	global.AUTH0_DOMAIN = 'squid.auth0.com';
	global.AUTH0_CALLBACK_URL = 'https://squid.auth0.com/login/callback';
	global.SQUID_APP_ID = 'e2a61aa025a94de7908ee1a13abe7c54';
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
		CUSTOM: false,
		PRIMARY_COLOR: {
			name: 'deep-orange',
			value: {}
		},
		SECONDARY_COLOR: {
			name: 'red',
			value: {}
		}
	};

})(window);
