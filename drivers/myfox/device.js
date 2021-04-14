'use strict';

const Homey = require('homey');
const { OAuth2Device } = require('homey-oauth2app');

var intervalHandle;

class MyFoxDevice extends OAuth2Device {
  async onOAuth2Init() {
    this.log('device.js onOAuth2Init()');

    this.registerCapabilityListener('homealarm_state', this.onCapabilityHomeAlarmState.bind(this));

    // Indicate Homey is connecting to Toon
    await this.setUnavailable(Homey.__('authentication.connecting'));

    // Fetch initial data update
    await this.getSite();

    intervalHandle = setInterval( () => this.getSite(), 10000 );
	
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
	 * Getter for site id.
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
    if (data) {
      this.log('security_level = '+data.security_level);
      const haState = data.security_level === 'partial' ? 'partially_armed' : data.security_level;
      this.setCapabilityValue('homealarm_state', haState).catch(this.error);

      // Check for alarm info
      if (data.alarm) {
        const status = data.alarm.status; //"none", "ongoing"
        this.log('alarm state = '+status);
        if (status === 'none') {
          // clear any possbile alarm
          this.setCapabilityValue('alarm_generic', false).catch(this.error);
          this.setCapabilityValue('alarm_fire', false).catch(this.error);
          this.setCapabilityValue('alarm_tamper', false).catch(this.error);
        }
        else {
          const alarmType = data.alarm.alarm_type; //"panic", "trespass", "smoke"
          this.log('alarm type = '+alarmType);
          if (alarmType === 'panic') {
            this.setCapabilityValue('alarm_tamper', true).catch(this.error);
          }
          else if (alarmType === 'trespass') {
            this.setCapabilityValue('alarm_generic', true).catch(this.error);
          }
          else if (alarmType === 'smoke') {
            this.setCapabilityValue('alarm_fire', true).catch(this.error);
          }
        }
      }
      else {
        this.log("Alarm status not found");
      }
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

  /**
   * Set the state of the device, overrides the program.
   * @param state ['away', 'home', 'sleep', 'comfort']
   * @param keepProgram - if true program will resume after state change
   */
   async updateAlarmState(state) {

    const myFoxState = state === 'partially_armed' ? 'partial' : state;
    try {
      await this.oAuth2Client.updateAlarmState(this.id, myFoxState);
      await this.setCapabilityValue('homealarm_state', state);
    } catch (err) {
      this.error(`updateState() -> error, failed to set homealarm state to ${state}`, err.stack);
      throw new Error(Homey.__('capability.error_set_homealarm_state', { error: err.message || err.toString() }));
    }

    this.log(`updateState() -> success setting homealarm state to ${state}`);
    return state;
  }

  onCapabilityHomeAlarmState(state) {
    this.log('onCapabilityHomeAlarmState() ->', 'state:', state);
    return this.updateAlarmState(state);
  }
}
module.exports = MyFoxDevice;
