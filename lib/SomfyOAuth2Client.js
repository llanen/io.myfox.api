'use strict';

const { OAuth2Client } = require('homey-oauth2app');

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

	/**
   * Get user info for single site
   * @returns {Promise<*>}
   */
  async getUser(id) {
	this.log('getUser() id:'+id);
	return this.get({
		path: `site/${id}/user`,
	});
}

}

module.exports = SomfyOAuth2Client;
