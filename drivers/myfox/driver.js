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
	
	// onInit() {
	// 	this.log('MyDriver has been inited');
	// }
	
	// onPair( socket ) {
	// 	this.log('On Pair');
	// 	let apiUrl = 'https://accounts.somfy.com/oauth/oauth/v2/auth?response_type=code&client_id=' + Homey.env.CLIENT_ID + '&redirect_uri=https%3A%2F%2Fcallback.athom.com%2Foauth2%2Fcallback%2F&state=homeyState'

    //     let myOAuth2Callback = new Homey.CloudOAuth2Callback(apiUrl)
    //         myOAuth2Callback
    //             .on('url', url => {
	// 				this.log('URL');
    //                 // dend the URL to the front-end to open a popup
    //                 socket.emit('url', url);

    //             })
    //             .on('code', code => {
	// 				this.log('CODE');
    //                 // ... swap your code here for an access token

    //                 // tell the front-end we're done
    //                 socket.emit('authorized');
    //             })
    //             .generate()
    //             .catch( err => {
    //                 socket.emit('error', err);
    //             })

    // }
}

module.exports = MyDriver;