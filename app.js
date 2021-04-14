'use strict';

const Homey = require('homey');
const { OAuth2App, OAuth2Util } = require('homey-oauth2app');

const SomfyOAuth2Client = require('./lib/SomfyOAuth2Client');

class MyApp extends OAuth2App {
	
	async onOAuth2Init() {
		//this.enableOAuth2Debug();
		this.setOAuth2Config({
		  client: SomfyOAuth2Client,
		  clientId: Homey.env.CLIENT_ID,
		  clientSecret: Homey.env.CLIENT_SECRET,
		  apiUrl: "https://api.myfox.io/v3/",
		  tokenUrl: "https://accounts.somfy.com/oauth/oauth/v2/token",
		  authorizationUrl: "https://accounts.somfy.com/oauth/oauth/v2/auth",
		});
		this.log(`${this.id} running...`);
	  }
}

module.exports = MyApp;