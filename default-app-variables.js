(function (global) {
	"use strict";

	moment.locale('pt-br');
	var hostName = window.location.hostname;

	function isLocalhost() {
		return window.location.hostname === 'localhost';
	}

	function _getEndPointUrl() {
		if (isLocalhost()) {
			return 'http://localhost:5003';
		} else if (hostName.indexOf('-dev') > -1) {
			return 'http://api.squidit.com.br:81';
		} else {
			return 'http://api.squidit.com.br';
		}
	}

	function _getCampaignEndPointUrl() {
		if (isLocalhost()) {
			return 'http://localhost:5021/v1';
		} else if (hostName.indexOf('-dev') > -1) {
			return 'https://campanhas-dev.squidit.com.br/v1';
		} else {
			return 'https://campanhas.squidit.com.br/v1';
		}
	}

	function _getSpidermanUrl() {
		if (isLocalhost()) {
			return 'http://localhost:5555/v1';
		} else if (hostName.indexOf('-dev') > -1) {
			return 'http://api-spiderman.azurewebsites.net/v1';
		} else {
			return 'http://api-spiderman.azurewebsites.net/v1';
		}
	}

	function _getAppId() {
		if (isLocalhost()) {
			return global.APP_CONFIG.SQUID_APP_ID;
		} else if (hostName.indexOf('-dev') > -1) {
			return global.APP_CONFIG.SQUID_APP_ID;
		} else {
			return global.APP_CONFIG.SQUID_APP_ID;
		}
	}

	global.APP_CONFIG = {
		APP_DIR: '',
		END_POINT_URL: _getEndPointUrl,
		SERVICES_END_POINT_URL: _getEndPointUrl,
		CAMPAIGN_END_POINT_URL: _getCampaignEndPointUrl,
		SPIDERMAN_END_POINT_URL: _getSpidermanUrl,
		SQUID_APP_ID: '8818ac1766c14575acc04918a433c085',
		START_VIEW: '/mission/actives', // /checkout
		LOGIN_ROUTE: '/login',
		USE_LOGIN_REDIRECT_MODE: true,
		REQUIRE_AUTHENTICATION: true,
		APP_ID: _getAppId,
		VIEWS: {
			TEMPLATES: {
				DEFAULT: function () {
					return APP_CONFIG.APP_DIR + '/views/templates/default.html'
				},
				LOGIN: function () {
					return APP_CONFIG.APP_DIR + '/views/templates/login.html'
				}
			}
		},
		CAMPAIGNS: {
			UNIQUE_CAMPAIGN: {
				IS_UNIQUE: false,
				ABOUT: {
					SHOW: true,
					TEXTS: [{
						ORDER: 1,
						CONTENT: '<p>APP_CONFIG.CAMPAIGNS.UNIQUE_CAMPAIGN.ABOUT.TEXTS.STEP_1<p>'
					}, {
						ORDER: 2,
						CONTENT: '<p>APP_CONFIG.CAMPAIGNS.UNIQUE_CAMPAIGN.ABOUT.TEXTS.STEP_2<p>'
					}]
				}
			},
			ONLY_APPROVED: false
		},
		RANK: {
			SHOW: true,
		},
		WORKFLOWS: {
			LOGIN: {
				AFTER: [
					'TermsOfUseWorkflowInitializer',
					'AboutCampaignWorkflowInitializer',
					'UserMetadataWorkflowInitializer',
					'RedirectToStartViewWorkflowInitializer'
				]
			},
			ROUTES: {
				CHANGED: ['TermsOfUseValidator']
			}
		},
		USER_METADATA: {
			REQUIRED_INFOS: ['email']
		},
		CHECKOUT: {
			REQUIRED_INFOS: ['name', 'gender', 'email', 'birthday', 'city', 'state']
		},
		SHOW_INSTAGRAM_LINKER: true,
		TERMS_OF_USE: {
			SHOW: true,
			LINK: 'https://drive.google.com/file/d/0BzGcM7wAXRLFOERBcHhlWkhZaE0/view',
			TEXT: 'TEXTO_REGULAMENTO'
		},
		PRIVACY_POLICY: {
			SHOW: true,
			LINK: 'https://drive.google.com/file/d/0BzGcM7wAXRLFSnZYVjdoY0pOWUk/view'
		},
		AUTH0: {
			CLIENT_ID: 'xmwmLJ1KnUrU3vJVW1uNfvIb4TCpguVX',
			DOMAIN: 'squid.auth0.com',
			CALLBACK_URL: 'https://squid.auth0.com/login/callback'
		},
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
			'ngMask',
			'ngMessages'
		]
	};

})(window);