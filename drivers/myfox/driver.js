'use strict';

const Homey = require('homey');

const MyFoxDevice = require('./device.js');
const { OAuth2Driver } = require('homey-oauth2app');

class MyDriver extends OAuth2Driver {

	onOAuth2Init() {
		this.log('onOAuth2Init()');
		super.onOAuth2Init();

		this.log('onOAuth2Init() -> success');
	}

	/**
   * The method will be called during pairing when a list of devices is needed. Only when this class
   * extends WifiDriver and provides a oauth2ClientConfig onInit. The data parameter contains an
   * temporary OAuth2 account that can be used to fetch the devices from the users account.
   * @returns {Promise}
   */
	async onPairListDevices({ oAuth2Client }) {
		this.log('onPairListDevices()');

		let sites;

		try {
			sites = await oAuth2Client.getSites();
		} catch (err) {
			this.error('onPairListDevices() -> error, failed to get sites, reason:', err.message);
		}

		this.log(`onPairListDevices()`);
		this.log(sites);

		this.log("Got "+ sites.items.length+" sites");

		if (Array.isArray(sites.items)) {
			return sites.items.map(site => ({
				name: (sites.items.length > 1) ? `MyFox: ${site.address1}` : 'MyFox',
				data: {
					id: site.site_id
				},
				store: {
					apiVersion: 3,
				},
			}));
		}
		return [];
	}

	/**
   * Always use MyFoxDevice as device for this driver.
   * @returns {MyFoxDevice}
   */
	mapDeviceClass() {
		return MyFoxDevice;
	}
}

module.exports = MyDriver;