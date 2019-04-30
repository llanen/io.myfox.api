'use strict';

const Homey = require('homey');
const { OAuth2App, OAuth2Util } = require('homey-oauth2app');

const SomfyOAuth2Client = require('./lib/SomfyOAuth2Client');

class MyApp extends OAuth2App {
	
	async onOAuth2Init() {
		this.enableOAuth2Debug();
		this.setOAuth2Config({
			client: SomfyOAuth2Client,
			apiUrl: Homey.env.SOMFY_API_BASE,
			tokenUrl: Homey.env.SOMFY_TOKEN_ENDPOINT,
			authorizationUrl: Homey.env.SOMFY_AUTH_ENDPOINT
		});

		this.log(`${this.id} running...`);
	}
}

module.exports = MyApp;