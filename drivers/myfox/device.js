'use strict';

const Homey = require('homey');
const { OAuth2Device, OAuth2Token, OAuth2Util } = require('homey-oauth2app');

class MyFoxDevice extends OAuth2Device {

  async onOAuth2Init() {
    this.log('device.js onOAuth2Init()');

    // Indicate Homey is connecting to Toon
    await this.setUnavailable(Homey.__('authentication.connecting'));

    // Fetch initial data update
    await this.getSite();
	
    await this.setAvailable();

    this.log('onOAuth2Init() -> success');
  }

  /**
   * Method that takes a sessionId and configId, finds the OAuth2Client based on that, then binds the new OAuth2Client
   * instance to this HomeyDevice instance. Basically it allows switching OAuth2Clients on a HomeyDevice.
   * @param {string} sessionId
   * @param {string} configId
   * @returns {Promise<void>}
   */
  async resetOAuth2Client({ sessionId, configId }) {
    this.log('onOAuth2Init()');

    // Store updated client config
    await this.setStoreValue('OAuth2SessionId', sessionId);
    await this.setStoreValue('OAuth2ConfigId', configId);

    // Check if client exists then bind it to this instance
    let client;
    if (Homey.app.hasOAuth2Client({ configId, sessionId })) {
      client = Homey.app.getOAuth2Client({ configId, sessionId });
    } else {
      this.error('OAuth2Client reset failed');
      return this.setUnavailable(Homey.__('authentication.re-login_failed'));
    }

    // Rebind new oAuth2Client
    this.oAuth2Client = client;

    // Check if device agreementId is present in OAuth2 account
    const sites = await this.oAuth2Client.getSites();
    if (Array.isArray(sites.items) &&
      sites.items.find(site => site.site_id === this.id)) {
      return this.setAvailable();
    }
	return this.setUnavailable(Homey.__('authentication.device_not_found'));
  }

	/**
	 * Getter for agreementId.
	 * @returns {*}
	 */
	get id() {
		return this.getData().id;
	}

  /**
   * This method will be called when the device has been deleted, it makes
   * sure the client is properly destroyed and left over settings are removed.
   */
  async onOAuth2Deleted() {
    this.log('onOAuth2Deleted()');
  }

  /**
   * Method that handles processing an incoming site information
   * @param data
   * @private
   */
  processSite(data) {
    this.log('processSite', new Date().getTime());
    this.log(data);
    if (data) {
      this.log('security_level = '+data.security_level);
    }
  }

  /**
   * This method will retrieve site information
   * @returns {Promise}
   */
  async getSite() {
	this.log("GetSite id:"+this.id);  
    try {
      const data = await this.oAuth2Client.getSite(this.id);
      this.processSite(data);
    } catch (err) {
      this.error('getSite() -> error, failed to retrieve site data', err.message);
    }
  }
}
module.exports = MyFoxDevice;
