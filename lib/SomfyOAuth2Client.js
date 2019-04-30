'use strict';

const Homey = require('homey');
const querystring = require('querystring');
const { URLSearchParams } = require('url');
const { fetch, OAuth2Client, OAuth2Token } = require('homey-oauth2app');

class SomfyOAuth2Client extends OAuth2Client {

	/**
   * Get all Sites (registered MyFox devices) for this user account.
   * @returns {Promise<*>}
   */
	async getSites() {
		this.log('getSites()');
		return this.get({
			path: 'site',
		});
	}
	
	/**
   * Get single site for this user account.
   * @returns {Promise<*>}
   */
	async getSite(id) {
		this.log('getSite() id:'+id);
		return this.get({
			path: `site/${id}`,
		});
	}

}

module.exports = SomfyOAuth2Client;
