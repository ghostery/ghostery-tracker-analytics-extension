/**
 * Globals Class
 *
 * Project Constants
 *
 * Insights by Ghostery
 */

import Parser from 'ua-parser-js';

const Manifest = chrome.runtime.getManifest();

class Globals {
  constructor() {
    // environment variables
    this.LOG = Manifest.log || false;
    this.DEBUG = Manifest.debug || false;
    this.EXTENSION_NAME = Manifest.name || 'Insights by Ghostery';
    this.EXTENSION_VERSION = Manifest.version_name || Manifest.version;
    this.BROWSER_INFO = {
      displayName: '', name: '', token: '', version: '', os: 'other',
    };
    this.BROWSER_INFO_READY = this.buildBrowserInfo();

    // init
    this.INIT_COMPLETE = false;
    this.initProps = {};

    // domains
    this.GHOSTERY_DOMAIN = this.DEBUG ? 'ghosterystage' : 'ghostery';
    this.METRICS_SUB_DOMAIN = this.DEBUG ? 'staging-d' : 'd';
    this.CDN_SUB_DOMAIN = this.DEBUG ? 'staging-cdn' : 'cdn';
    this.AUTH_SERVER = `https://consumerapi.${this.GHOSTERY_DOMAIN}.com`;
    this.SIGNON_SERVER = `https://signon.${this.GHOSTERY_DOMAIN}.com`;
    this.ACCOUNT_SERVER = `https://accountapi.${this.GHOSTERY_DOMAIN}.com`;
    this.ACCOUNT_SERVER_VERSION = 'v2.0.1';
  }

  buildBrowserInfo() {
    const ua = Parser(navigator.userAgent);
    const browser = ua.browser.name.toLowerCase();
    const version = parseInt(ua.browser.version.toString(), 10); // convert to string for Chrome
    const platform = ua.os.name.toLowerCase();

    // Set name and token properties. CMP uses `name` value.  Metrics uses `token`
    if (browser.includes('edge')) {
      this.BROWSER_INFO.displayName = 'Edge';
      this.BROWSER_INFO.name = 'edge';
      this.BROWSER_INFO.token = 'ed';
    } else if (browser.includes('opera')) {
      this.BROWSER_INFO.displayName = 'Opera';
      this.BROWSER_INFO.name = 'opera';
      this.BROWSER_INFO.token = 'op';
    } else if (browser.includes('chrome')) {
      this.BROWSER_INFO.displayName = 'Chrome';
      this.BROWSER_INFO.name = 'chrome';
      this.BROWSER_INFO.token = 'ch';
    } else if (browser.includes('firefox')) {
      this.BROWSER_INFO.displayName = 'Firefox';
      this.BROWSER_INFO.name = 'firefox';
      this.BROWSER_INFO.token = 'ff';
    } else if (browser.includes('yandex')) {
      this.BROWSER_INFO.displayName = 'Yandex';
      this.BROWSER_INFO.name = 'yandex';
      this.BROWSER_INFO.token = 'yx';
    }

    // Set OS property
    if (platform.includes('mac')) {
      this.BROWSER_INFO.os = 'mac';
    } else if (platform.includes('win')) {
      this.BROWSER_INFO.os = 'win';
    } else if (platform.includes('linux')) {
      this.BROWSER_INFO.os = 'linux';
    } else if (platform.includes('android')) {
      this.BROWSER_INFO.os = 'android';
    }

    // Set version property
    this.BROWSER_INFO.version = version;

    // Check for Ghostery browsers
    return this._checkBrowserInfo().then((info) => {
      if (info && info.name === 'Ghostery') {
        if (platform.includes('android')) {
          this.BROWSER_INFO.displayName = 'Ghostery Android Browser';
          this.BROWSER_INFO.name = 'ghostery_android';
          this.BROWSER_INFO.token = 'ga';
          this.BROWSER_INFO.os = 'android';
          this.BROWSER_INFO.version = info.version;
        } else {
          this.BROWSER_INFO.displayName = 'Ghostery Desktop Browser';
          this.BROWSER_INFO.name = 'ghostery_desktop';
          this.BROWSER_INFO.token = 'gd';
          this.BROWSER_INFO.version = info.version.split('.').join('');
        }
      }
    });
  }

  /**
  * Check for information about this browser (FF only)
  * @private
  * @return {Promise}
  */
  _checkBrowserInfo() {
    if (typeof chrome.runtime.getBrowserInfo === 'function') {
      return chrome.runtime.getBrowserInfo();
    }
    return Promise.resolve(false);
  }
}

// return the class as a singleton
export default new Globals();
