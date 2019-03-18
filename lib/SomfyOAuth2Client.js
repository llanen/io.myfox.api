'use strict';

const Homey = require('homey');
const querystring = require('querystring');
const { URLSearchParams } = require('url');
const { fetch, OAuth2Client, OAuth2Token } = require('homey-oauth2app');

class SomfyOAuth2Client extends OAuth2Client {

	/**
   * Method that exchanges a code for a token with the MyFox API. Important is that the redirect_uri property contains a
   * uri that ends with a slash, otherwise the request will fail with 401 for unknown reasons.
   * @param code
   * @returns {Promise<*>}
   */
	async onGetTokenByCode({ code }) {
		const params = new URLSearchParams();
		params.append('grant_type', 'authorization_code');
		params.append('client_id', this._clientId);
		params.append('client_secret', this._clientSecret);
		params.append('redirect_uri', 'https://callback.athom.com/oauth2/callback/'); // the trailing slash is needed
		params.append('code', code);

		const res = await fetch(this._tokenUrl, { method: 'POST', body: params });
		const body = await res.json();
		return new OAuth2Token(body);
	}

	/**
   * Method that handles the creation of the authorization url.
   * as query parameter.
   * @param scopes
   * @param state
   * @returns {string}
   */
	onHandleAuthorizationURL({ scopes, state } = {}) {
		const query = {
			state,
			client_id: this._clientId,
			response_type: 'code',
			scope: this.onHandleAuthorizationURLScopes({ scopes }),
			redirect_uri: this._redirectUrl,
		};

		return `${this._authorizationUrl}?${querystring.stringify(query)}`;
	}

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
