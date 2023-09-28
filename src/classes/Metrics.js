/**
 * Metrics
 *
 * Implements Metrics for Ghostery Insights.
 *
 * Insights by Ghostery
 */

import Globals from './Globals';
import Settings from './Settings';
import { log } from '../utils/common';
import { processUrlQuery } from '../utils/utils';

// CONSTANTS
const FREQUENCIES = { // in milliseconds
  daily: 86400000,
  weekly: 604800000,
  biweekly: 1209600000,
  monthly: 2419200000,
};
const CRITICAL_METRICS = ['install', 'install_complete', 'upgrade', 'active', 'engaged', 'uninstall'];
const CAMPAIGN_METRICS = ['install', 'active', 'uninstall'];
const { METRICS_SUB_DOMAIN, EXTENSION_VERSION, BROWSER_INFO, BROWSER_INFO_READY } = Globals;
const MAX_DELAYED_PINGS = 100;
/**
 * Class for handling telemetry pings.
 * @memberOf  BackgroundClasses
 */
class Metrics {
  constructor() {
    this.utm_source = '';
    this.utm_campaign = '';
    this.ping_set = new Set();
  }

  /**
  * Set UTM parameters.
  *
  * On JUST_INSTALLED, from ghostery.com/products install URL if present.
  * Otherwise, tries to pull them from prefs.
  * This method is called once on startup.
  */
  init() {
    if (Globals.JUST_INSTALLED) {
      return new Promise((resolve) => {
        let foundUTM = false;
        // This query fails on Edge
        chrome.tabs.query({
          url: ['https://*.ghostery.com/*'],
        }, (tabs) => {
          tabs.forEach((tab) => {
            if (foundUTM) { return; }

            const query = processUrlQuery(tab.url);
            if (!query.utm_source || !query.utm_campaign) { return; }

            this.utm_source = query.utm_source;
            this.utm_campaign = query.utm_campaign;
            foundUTM = true;
            const metrics = Settings.get('metrics');
            metrics.utm_source = this.utm_source;
            metrics.utm_campaign = this.utm_campaign;
            Settings.set('metrics', metrics);
          });
          resolve();
        });
      });
    }

    return new Promise((resolve) => {
      const metrics = Settings.get('metrics');
      this.utm_source = metrics.utm_source || '';
      this.utm_campaign = metrics.utm_campaign || '';
      resolve();
    });
  }

  /**
  * Prepare data and send telemetry pings.
  * @param {string} type    type of the telemetry ping
  */
  ping(data) {
    const { type, insightsView } = data;
    switch (type) {
      case 'install':
        this._recordInstall();
        break;
      case 'upgrade':
        this._recordUpgrade();
        break;
      case 'active':
        this._recordActive();
        break;
      case 'engaged':
        this._recordEngaged();
        break;
      case 'close_blue_bar':
      case 'export_data':
      case 'favorite_tracker':
      case 'open_settings_panel':
      case 'sign_in':
      case 'sign_in_success':
      case 'sign_out':
      case 'sort_trackerInformationTab':
      case 'subscribe':
      case 'toggle_freeze':
      case 'toggle_linear':
      case 'toggle_live':
      case 'toggle_logarithmic':
      case 'tutorial_start':
      case 'tracker_click_trackerDistribution':
      case 'tracker_expand_trackerInformationList':
      case 'tracker_expand_trackerList':
      case 'tracker_parentage_click_request_type_filter':
      case 'tracker_parentage_click_request_list_item':
      case 'unfavorite_tracker':
      case 'visit_glossary':
      case 'visit_trackerInformationTab':
      case 'visit_tutorial':
      case 'tracker_parentage_visit':
      case 'visit_insightsTab':
      case 'visit_insightsPanel':
        this._sendReq(type, ['all', 'daily', 'weekly', 'monthly'], insightsView);
        break;
      // Uncaught Pings
      default:
        log(`metrics ping() error: ping name ${type} not found`);
        break;
    }
  }

  /**
   * Build telemetry URL
   *
    * @private
    *
   * @param  {string} type       ping type
   * @param  {string} frequency   ping frequency
   * @return {string}            complete telemetry url
   */
  async _buildMetricsUrl(type, frequency, insightsView, sortType) {
    // Make sure that Globals._checkBrowserInfo() has resolved before we proceed,
    // so that we use the correct BROWSER_INFO values if we are in
    // the Ghostery Desktop or Ghostery Android browsers
    await BROWSER_INFO_READY;

    const frequencyString = (type !== 'uninstall') ? `/${frequency}` : '';
    const metrics = Settings.get('metrics');
    let metrics_url = `https://${METRICS_SUB_DOMAIN}.ghostery.com/${type}${frequencyString}?gr=-1`
      // Extension version
      + `&v=${encodeURIComponent(EXTENSION_VERSION)}`
      // User agent - browser
      + `&ua=${encodeURIComponent(`in-${BROWSER_INFO.token}`)}`
      // Operating system
      + `&os=${encodeURIComponent(BROWSER_INFO.os)}`
      // Browser version
      + `&bv=${encodeURIComponent(BROWSER_INFO.version)}`
      // Install Date
      + `&id=${encodeURIComponent(metrics.install_date)}`
      // Login state (former signed_in)
      + '&sn=-1'
      // Recency, days since last active daily ping
      + `&rc=${encodeURIComponent(this._getRecencyActive(type, frequency).toString())}`
      // Subscription Type
      + '&st=-1'
      // Active Velocity
      + `&va=${encodeURIComponent(this._getVelocityActive(type).toString())}`
      // Engaged Recency
      + `&re=${encodeURIComponent(this._getRecencyEngaged(type, frequency).toString())}`
      // Engaged Velocity
      + `&ve=${encodeURIComponent(this._getVelocityEngaged(type).toString())}`
      // Insights View
      // Using setup step as  a temporary substitute
      + `&ss=${insightsView ? encodeURIComponent(insightsView) : 'na'}`
      // Sort type
      // Using setup block as  a temporary substitute
      + `&sb=${sortType ? encodeURIComponent(sortType) : 'na'}`;

    if (CAMPAIGN_METRICS.includes(type)) {
      // only send campaign attribution when necessary
      metrics_url
      // Marketing source (Former utm_source)
      += `&us=${encodeURIComponent(this.utm_source)}`
      // Marketing campaign (Former utm_campaign)
      + `&uc=${encodeURIComponent(this.utm_campaign)}`;
    }

    return metrics_url;
  }

  /**
   * Send Ping Request
   *
   * @private
   *
   * @param {string}     type             ping type
   * @param {array}     [frequencies = ['all']]   array of ping frequencies
   */
  _sendReq(type, frequencies, insightsView, sortType) {
    if (typeof frequencies === 'undefined') {
      frequencies = ['all']; // eslint-disable-line no-param-reassign
    }
    frequencies.forEach(async (frequency) => {
      if (this._checkPing(type, frequency)) {
        const timeNow = Number((new Date()).getTime());
        const metrics_url = await this._buildMetricsUrl(type, frequency, insightsView, sortType);
        // update Conf timestamps for each ping type and frequency
        const metrics = Settings.get('metrics') || {};
        metrics[`${type}_${frequency}`] = timeNow;
        Settings.set('metrics', metrics);

        log(`sending ${type} ping with ${frequency} frequency`);

        const xhr = new XMLHttpRequest();
        xhr.open('GET', metrics_url, true);
        xhr.setRequestHeader('Content-Type', 'image/gif');
        xhr.send();
      }
    });
  }

  /**
   * Set uninstall url
   */
  async setUninstallUrl() {
    if (typeof chrome.runtime.setUninstallURL === 'function') {
      const metrics_url = await this._buildMetricsUrl('uninstall');
      if (metrics_url.length) {
        chrome.runtime.setUninstallURL(metrics_url);
      }
    }
  }

  /**
   * Calculate days since the last daily active ping.
   *
   * @private
   *
   * @return {number}   in days since the last daily active ping
   */
  _getRecencyActive(type, frequency) {
    const metrics = Settings.get('metrics');
    if (metrics.active_daily && (type === 'active' || type === 'engaged') && frequency === 'daily') {
      return this._daysSince(metrics.active_daily);
    }
    return -1;
  }

  /**
   * Calculate days since the last daily engaged ping.
   *
   * @private
   *
   * @return {number}   in days since the last daily engaged ping
   */
  _getRecencyEngaged(type, frequency) {
    const metrics = Settings.get('metrics');
    if (metrics.engaged_daily && (type === 'active' || type === 'engaged') && frequency === 'daily') {
      return this._daysSince(metrics.engaged_daily);
    }
    return -1;
  }

  /**
   * Get the Active Velocity
   * @private
   * @return {number}  The Active Velocity
   */
  _getVelocityActive(type) {
    if (type !== 'active' && type !== 'engaged') {
      return -1;
    }
    const metrics = Settings.get('metrics');
    const active_daily_velocity = metrics.active_daily_velocity || [];
    const today = this._daysSince(0);
    return active_daily_velocity.filter(el => el > today - 7).length;
  }

  /**
   * Get the Engaged Velocity
   * @private
   * @return {number}  The Engaged Velocity
   */
  _getVelocityEngaged(type) {
    if (type !== 'active' && type !== 'engaged') {
      return -1;
    }
    const metrics = Settings.get('metrics');
    const engaged_daily_velocity = metrics.engaged_daily_velocity || [];
    const today = this._daysSince(0);
    return engaged_daily_velocity.filter(el => el > today - 7).length;
  }

  /**
   * Calculate remaining scheduled time for a ping
   *
   * @private
   *
   * @param {string}  type     type of the recorded event
   * @param {string}  frequency   one of 'all', 'daily', 'weekly'
   * @return {number}         number in milliseconds over the frequency since the last ping
   */
  _timeToExpired(type, frequency) {
    if (frequency === 'all') {
      return 0;
    }
    const metrics = Settings.get('metrics');
    const result = metrics[`${type}_${frequency}`];
    const last = (result === undefined) ? 0 : result;
    const now = Number((new Date()).getTime());
    const frequency_ago = now - FREQUENCIES[frequency];
    return (last === null) ? 0 : (last - frequency_ago);
  }

  /**
   * Decide if the ping should be sent
   *
   * @private
   *
   * @param {string} type      type of the recorded event
   * @param {string} frequency   one of 'all', 'daily', 'weekly'
   * @return {boolean}       true/false
   */
  _checkPing(type, frequency) {
    const result = this._timeToExpired(type, frequency);
    if (result > 0) {
      return false;
    }
    if (CRITICAL_METRICS.includes(type)) {
      return true;
    }
    if (this.ping_set && this.ping_set.size < MAX_DELAYED_PINGS) {
      this.ping_set.add(type);
    } else {
      this.ping_set = [];
    }
    return true;
  }

  /**
   * Record Install event
   * @private
   */
  _recordInstall() {
    // We don't want to record 'install' twice
    const metrics = Settings.get('metrics');
    if (metrics.install_all) {
      return;
    }
    [metrics.install_date] = new Date().toISOString('en-US').split('T');
    Settings.set('metrics', metrics);
    this._sendReq('install');
  }

  /**
   * Record Upgrade event
   * @private
   */
  _recordUpgrade() {
    // set install_all on upgrade too
    const metrics = Settings.get('metrics');
    metrics.install_all = Number((new Date()).getTime());
    Settings.set('metrics', metrics);
    this._sendReq('upgrade');
  }

  /**
   * Record Engaged event
   * @private
   */
  _recordEngaged() {
    this._updateVelocityMetric('engaged_daily_velocity');
    this._sendReq('engaged', ['daily', 'weekly', 'monthly']);
  }

  /**
   * Record Active event
   * @private
   */
  _recordActive() {
    this._updateVelocityMetric('active_daily_velocity');

    const daily = this._timeToExpired('active', 'daily');
    if (daily > 0) {
      setTimeout(() => {
        this._sendReq('active', ['daily']);
        setInterval(() => {
          this._sendReq('active', ['daily']);
        }, FREQUENCIES.daily);
      }, daily);
    } else {
      this._sendReq('active', ['daily']);
      setInterval(() => {
        this._sendReq('active', ['daily']);
      }, FREQUENCIES.daily);
    }

    const weekly = this._timeToExpired('active', 'weekly');
    if (weekly > 0) {
      setTimeout(() => {
        this._sendReq('active', ['weekly']);
        setInterval(() => {
          this._sendReq('active', ['weekly']);
        }, FREQUENCIES.weekly);
      }, weekly);
    } else {
      this._sendReq('active', ['weekly']);
      setInterval(() => {
        this._sendReq('active', ['weekly']);
      }, FREQUENCIES.weekly);
    }

    const monthly = this._timeToExpired('active', 'monthly');
    if (monthly > 0) {
      if (monthly <= FREQUENCIES.biweekly) {
        setTimeout(() => {
          this._sendReq('active', ['monthly']);
          this._repeat();
        }, monthly);
      } else {
        setTimeout(() => {
          setTimeout(() => {
            this._sendReq('active', ['monthly']);
            this._repeat();
          }, monthly - FREQUENCIES.biweekly);
        }, FREQUENCIES.biweekly);
      }
    } else {
      this._sendReq('active', ['monthly']);
      this._repeat();
    }
  }

  /**
   * Repeat sending active request every month
   * if computer is continuously on.
   * @private
   */
  _repeat() {
    let flag = false;
    setInterval(() => {
      if (flag) {
        this._sendReq('active', ['monthly']);
      }
      flag = !flag;
    }, FREQUENCIES.biweekly);
  }

  /**
   * Calculates how many days have passed since a timestamped event
   * @param {number} ms      millisecond timestamp of the event. 0 if omitted.
   * @returns {number}       the integer number of days since the event, rounded down
   * @private
   */
  _daysSince(ms) {
    const _ms = ms || 0;
    return Math.floor(Number(new Date().getTime() - _ms) / 86400000);
  }

  /**
   * Update the velocity array metric specified by the argument
   * @param {string} velocityArrayPropName
   * @private
   */
  _updateVelocityMetric(velocityArrayPropName) {
    const metrics = Settings.get('metrics');

    const velocities = metrics[velocityArrayPropName] || [];
    const today = this._daysSince(0);
    velocities.sort();
    if (!velocities.includes(today)) {
      velocities.push(today);
      if (velocities.length > 7) {
        velocities.shift();
      }
    }
    metrics[velocityArrayPropName] = velocities;

    Settings.set('metrics', metrics);
  }
}

// return the class as a singleton
export default new Metrics();
