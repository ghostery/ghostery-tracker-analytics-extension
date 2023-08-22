/**
 * TabDetails Class
 *
 * Keeps track of Open Ports and Data for a Parent Tab.
 *
 *  this._tabDetails[tabId]:
 *    activePorts                   {Object}    References to open, active Ports
 *    firstTrackerTimeStamp         {TimeStamp} The TimeStamp of the first completed Tracker request
 *    latestTrackerTimeStamp        {TimeStamp} The TimeStamp of the most recent Tracker request
 *    throttleSendRequestsByTracker {function}  throttled function that sets RequestsByTracker data
 *    throttleSendRequestsByType    {function}  throttled function that sets RequestsByType data
 *    throttleSetParsedUrl          {function}  throttled function that sets ParsedUrl data
 *    timestampsParsedUrl           {Object}    Parsed URL data snapshots
 *    timingPerformance             {Object}    `performance.timing` data from the Parent Tab
 *    timingWebNavigation           {Object}    Timing Events for WebNavigation Chrome API
 *
 * Insights by Ghostery
 */

import isEmpty from 'lodash.isempty';
import throttle from 'lodash.throttle';
import Account from './Account';
import RequestsByTracker from './RequestsByTracker';
import RequestsByType from './RequestsByType';
import Tabs from './Tabs';
import { processUrl, isValidUrl } from '../utils/utils';
import { log } from '../utils/common';

const THROTTLE_INTERVAL_MS = 500;
const PASS_THROUGH_MESSAGES = [
  'UserInfo',
  'Settings',
  'SettingsUpdated',
  'ReportIsLive',
  'ParentTabClosed',
];

class TabDetails {
  constructor() {
    this._tabDetails = {};
  }

  log() {
    log('TabDetails _tabDetails', this._tabDetails);
  }

  create(tabId, needsReload = false) {
    if (this.has(tabId)) {
      log(`create Error: ${tabId} already exists on TabDetails.`);
      return;
    }
    this._tabDetails[tabId] = {
      appDetails: {
        opened: false,
        appTabId: 0,
      },
      needsReload,
      frozenMessages: [],
      firstTrackerTimeStamp: 0,
      latestTrackerTimeStamp: 0,
      ports: { window: null, app: null },
      tabIsLive: true,
      throttleSendRequestsByTracker: throttle(this._sendRequestsByTracker.bind(this),
        THROTTLE_INTERVAL_MS, { leading: true, trailing: true }),
      throttleSendRequestsByType: throttle(this._sendRequestsByType.bind(this),
        THROTTLE_INTERVAL_MS, { leading: true, trailing: true }),
      throttleSetParsedUrl: throttle(this._setParsedUrl.bind(this),
        THROTTLE_INTERVAL_MS, { leading: true, trailing: true }),
      timestampsParsedUrl: { timestamps: [], data: {} },
      timingPerformance: {},
      timingWebNavigation: {},
      windowScripts: {
        performance: false,
        injectionControl: false,
        panel: false,
        injectReloadPopup: false,
      },
    };
  }

  hasReloadPopup(tabId) {
    return (this.has(tabId) && this._tabDetails[tabId].windowScripts.injectReloadPopup);
  }

  needsReload(tabId) {
    return (this.has(tabId) && this._tabDetails[tabId].needsReload);
  }

  has(tabId) {
    return this._tabDetails.hasOwnProperty(tabId);
  }

  remove(tabId) {
    if (!this.has(tabId)) {
      // log(`clear Error: TabId ${tabId} not recognized.`);
    }
    this._sendMessageOverPorts(tabId, 'ParentTabClosed');
    delete this._tabDetails[tabId];
  }

  clear(tabId) {
    let appPort;
    if (this.has(tabId)) {
      appPort = this._tabDetails[tabId].ports.app;
      this.remove(tabId);
    }

    this.create(tabId);
    if (appPort) {
      this.setPort(tabId, 'app', appPort);
      appPort.postMessage({ type: 'clear' });
      this._tabDetails[tabId].appDetails.opened = true;
      this._tabDetails[tabId].appDetails.appTabId = appPort.sender.tab.id;
    }
  }

  getTabDetails(tabId) {
    if (!this.has(tabId)) {
      log(`getTabDetails Error: TabId ${tabId} not recognized.`);
      return undefined;
    }

    const {
      firstTrackerTimeStamp,
      latestTrackerTimeStamp,
      tabIsLive,
      timestampsParsedUrl,
      timingPerformance,
      timingWebNavigation,
      needsReload,
    } = this._tabDetails[tabId];


    // Handle case where user clicks back button, returns to a non-scanned page,
    // then refreshes the insights app tab
    const urlDataObj = this._tabDetails[tabId].timestampsParsedUrl;
    const { timestamps } = urlDataObj;
    const latestTimestamp = timestamps.length > 0 ? timestamps[timestamps.length - 1] : 0;
    const latestUrlDataObj = urlDataObj.data[latestTimestamp] || {};

    let isPageNotScanned = false;
    if (latestUrlDataObj) {
      const processedUrl = processUrl(latestUrlDataObj.url);
      isPageNotScanned = !isValidUrl(processedUrl);
    }

    // urlDataObj may be empty on first load, uses needsReload first time around
    const tabDetails = {
      firstTrackerTimeStamp,
      latestTrackerTimeStamp,
      requestsByTracker: RequestsByTracker.getAllTrackers(tabId),
      trackerCount: RequestsByTracker.countAllTrackers(tabId),
      requestsByType: RequestsByType.getAllTypes(tabId),
      tabIsLive,
      timestampsParsedUrl,
      timingPerformance,
      timingWebNavigation,
      isPageNotScanned: needsReload || isPageNotScanned,
    };
    return tabDetails;
  }

  injectScript(tabId, type) {
    if (!this.has(tabId)) {
      log(`injectScript Error: TabId ${tabId} not recognized.`);
      return;
    }
    if (!this._tabDetails[tabId].windowScripts.hasOwnProperty(type)) {
      log(`injectScript Error: ${type} Script not recognized.`);
      return;
    }
    if (this._tabDetails[tabId].windowScripts[type]) {
      log(`injectScript Error: ${type} Script already injected for TabId ${tabId}.`);
      return;
    }
    this._tabDetails[tabId].windowScripts[type] = true;
    Tabs.executeScript(tabId, `/dist/${type}/index.js`);
  }

  togglePanel(tabId) {
    if (!this.has(tabId)) {
      log(`togglePanel Error: TabId ${tabId} not recognized.`);
      return;
    }

    const { panel } = this._tabDetails[tabId].windowScripts;
    const port = this._tabDetails[tabId].ports.window;

    if (panel) {
      port.postMessage({ type: 'RemovePanel' });
      this._tabDetails[tabId].windowScripts.panel = false;
    } else if (Account.eligibleForFreeTrial()) {
      Account.startFreeTrial()
        .finally(() => this._finishOpeningPanel(tabId, port));
    } else {
      this._finishOpeningPanel(tabId, port);
    }
  }

  _finishOpeningPanel(tabId, port) {
    port.postMessage({ type: 'InjectPanel' });
    this.injectScript(tabId, 'panel');
  }

  openApp(tabId, insightsInnerTab) {
    if (!this.has(tabId)) {
      log(`openApp Error: TabId ${tabId} not recognized.`);
      return;
    }

    const { opened, appTabId } = this._tabDetails[tabId].appDetails;
    if (!opened) {
      if (Account.eligibleForFreeTrial()) {
        Account.startFreeTrial()
          .finally(() => this._finishOpeningApp(tabId, insightsInnerTab));
      } else {
        this._finishOpeningApp(tabId, insightsInnerTab);
      }
    }
    if (appTabId) {
      Tabs.focusTabById(appTabId, insightsInnerTab);
    }
  }

  _finishOpeningApp(tabId, insightsInnerTab) {
    this.setAppDetails(tabId, { opened: true });
    Tabs.createInsightsApp(tabId, insightsInnerTab);
  }

  setAppDetails(tabId, { opened, appTabId }) {
    if (!this.has(tabId)) {
      // log(`setAppDetails Error: TabId ${tabId} not recognized.`);
      return;
    }

    if (opened === false) {
      this._tabDetails[tabId].appDetails = { opened, appTabId: 0 };
    }
    if (appTabId) {
      this._tabDetails[tabId].appDetails = { opened: true, appTabId };
    }
  }

  setPort(tabId, portName, port) {
    if (!this.has(tabId)) {
      // log(`setPort Error: TabId ${tabId} not recognized.`);
      return;
    }
    if (!this._tabDetails[tabId].ports.hasOwnProperty(portName)) {
      log(`setPort Error: Port Name ${portName} not recognized.`);
      return;
    }
    this._tabDetails[tabId].ports[portName] = port;
  }

  setIsLive(tabId, isLive) {
    if (!this.has(tabId)) {
      log(`setIsLive Error: TabId ${tabId} not recognized.`);
      return;
    }
    if (isLive === this._tabDetails[tabId].tabIsLive) { return; }
    this._tabDetails[tabId].tabIsLive = isLive;
    this._sendMessageOverPorts(tabId, 'ReportIsLive', isLive);
    if (isLive) {
      const { frozenMessages } = this._tabDetails[tabId];
      this._tabDetails[tabId].frozenMessages = [];
      for (let i = 0; i < frozenMessages.length; i++) {
        const { eventName, data } = frozenMessages[i];
        this._sendMessageOverPorts(tabId, eventName, data);
      }
    }
  }

  updateSettings(data) {
    if (!isEmpty(data)) {
      for (const tabId in this._tabDetails) {
        if (this.has(tabId)) {
          this._sendMessageOverPorts(tabId, 'SettingsUpdated', data);
        }
      }
    }
  }

  updateUserInfo(userInfo) {
    if (!isEmpty(userInfo)) {
      for (const tabId in this._tabDetails) {
        if (this.has(tabId)) {
          this._sendMessageOverPorts(tabId, 'UserInfo', userInfo);
        }
      }
    }
  }

  _sendMessageOverPorts(tabId, eventName, data) {
    if (!this.has(tabId)) {
      log(`_sendMessageOverPorts Error: TabId ${tabId} not recognized.`);
      return;
    }
    if (!this._tabDetails[tabId].tabIsLive && !PASS_THROUGH_MESSAGES.includes(eventName)) {
      this._tabDetails[tabId].frozenMessages.push({ eventName, data });
      // log(`TabId ${tabId} is Frozen so ${eventName} Message was not sent.`);
      return;
    }

    const ports = Object.values(this._tabDetails[tabId].ports);
    for (let i = 0; i < ports.length; i++) {
      const port = ports[i];
      if (port && port.postMessage) {
        if (typeof data !== 'undefined') {
          port.postMessage({ type: eventName, data });
        } else {
          port.postMessage({ type: eventName });
        }
      }
    }
  }

  sendRequestsByTracker(tabId, trackerId, timeStamp) {
    if (!trackerId) { return; }
    if (!this.has(tabId)) {
      log(`sendRequestsByTracker Error: TabId ${tabId} not recognized.`);
      return;
    }

    if (!this._tabDetails[tabId].hasOwnProperty('updatedTrackerIds')) {
      this._tabDetails[tabId].updatedTrackerIds = {};
    }
    this._tabDetails[tabId].updatedTrackerIds[trackerId] = true;
    if (!this._tabDetails[tabId].firstTrackerTimeStamp) {
      this._tabDetails[tabId].firstTrackerTimeStamp = timeStamp;
    }
    const oldTimeStamp = this._tabDetails[tabId].latestTrackerTimeStamp || 0;
    this._tabDetails[tabId].latestTrackerTimeStamp = Math.max(oldTimeStamp, timeStamp);

    this._tabDetails[tabId].throttleSendRequestsByTracker(tabId);
  }

  _sendRequestsByTracker(tabId) {
    if (!this.has(tabId)) {
      log(`_sendRequestsByTracker Error: TabId ${tabId} not recognized.`);
      return;
    }
    if (!this._tabDetails[tabId].hasOwnProperty('updatedTrackerIds')) {
      // log(`_sendRequestsByTracker Error: UpdatedTrackerIds not found for TabId ${tabId}.`);
      return;
    }

    const {
      firstTrackerTimeStamp,
      latestTrackerTimeStamp,
      updatedTrackerIds,
    } = this._tabDetails[tabId];
    const updatedIds = Object.keys(updatedTrackerIds);
    delete this._tabDetails[tabId].updatedTrackerIds;

    const updatedTrackers = RequestsByTracker.getTrackers(tabId, updatedIds);
    const trackerCount = RequestsByTracker.countAllTrackers(tabId);
    this._sendMessageOverPorts(tabId, 'RequestsByTrackerDelta', {
      updatedTrackers,
      firstTrackerTimeStamp,
      latestTrackerTimeStamp,
      trackerCount,
    });
  }

  sendRequestsByType(tabId, type) {
    if (!this.has(tabId)) {
      log(`sendRequestsByType Error: TabId ${tabId} not recognized.`);
      return;
    }

    if (!this._tabDetails[tabId].hasOwnProperty('updatedTypes')) {
      this._tabDetails[tabId].updatedTypes = {};
    }
    this._tabDetails[tabId].updatedTypes[type] = true;

    this._tabDetails[tabId].throttleSendRequestsByType(tabId);
  }

  _sendRequestsByType(tabId) {
    if (!this.has(tabId)) {
      log(`_sendRequestsByType Error: TabId ${tabId} not recognized.`);
      return;
    }
    if (!this._tabDetails[tabId].hasOwnProperty('updatedTypes')) {
      // log(`_sendRequestsByType Error: UpdatedTypes not found for TabId ${tabId}.`);
      return;
    }

    const updatedTypes = Object.keys(this._tabDetails[tabId].updatedTypes);
    delete this._tabDetails[tabId].updatedTypes;

    const data = RequestsByType.getTypes(tabId, updatedTypes);
    this._sendMessageOverPorts(tabId, 'RequestsByTypeDelta', data);
  }

  setParsedUrl(tabId, url, timeStamp) {
    if (!this.has(tabId)) {
      // log(`setParsedUrl Error: TabId ${tabId} not recognized.`);
      return;
    }
    this._tabDetails[tabId].throttleSetParsedUrl(tabId, url, timeStamp);
  }

  _setParsedUrl(tabId, url, timeStamp) {
    if (!this.has(tabId)) {
      log(`_setParsedUrl Error: TabId ${tabId} not recognized.`);
    }

    const urlDataObj = this._tabDetails[tabId].timestampsParsedUrl;
    const lastTimestamp = urlDataObj.timestamps[urlDataObj.timestamps.length - 1];
    const prevData = urlDataObj.data[lastTimestamp] || {};
    if (url === prevData.url) { return; }

    const timestampedData = this._tabDetails[tabId].timestampsParsedUrl;
    if (timestampedData.data.hasOwnProperty(timeStamp)) {
      log(`_setParsedUrl Error: ${timeStamp} already exists for TabId ${tabId}.`);
    }
    const parsedUrl = { url, ...processUrl(url) };
    timestampedData.timestamps.push(timeStamp);
    timestampedData.data[timeStamp] = parsedUrl;

    if (isValidUrl(parsedUrl)) {
      this._sendMessageOverPorts(tabId, 'parsedUrl', {
        timestamp: timeStamp,
        data: parsedUrl,
      });
    } else {
      // Handle case where user clicks back button and returns to a non-scanned page
      this._sendMessageOverPorts(tabId, 'PageNotScanned');
    }
  }

  setPerformance(tabId, timingPerformance) {
    if (!this.has(tabId)) {
      // log(`setPerformance Error: TabId ${tabId} not recognized.`);
      return;
    }
    this._tabDetails[tabId].timingPerformance = { ...timingPerformance };

    const timing = this._tabDetails[tabId].timingPerformance;
    this._sendMessageOverPorts(tabId, 'timingPerformance', timing);
  }

  setWebNavigation(tabId, eventName, timeStamp) {
    if (!this.has(tabId)) {
      // log(`setWebNavigation Error: TabId ${tabId} not recognized.`);
      return;
    }

    const timing = this._tabDetails[tabId].timingWebNavigation;
    if (timing.hasOwnProperty(eventName) && eventName !== 'onHistoryStateUpdated') {
      log(`setWebNavigation Error: ${eventName} already exists for TabId ${tabId}.`);
      return;
    }

    if (eventName !== 'onHistoryStateUpdated') {
      timing[eventName] = timeStamp;
    } else {
      timing[eventName] = timing[eventName] || [];
      timing[eventName].push(timeStamp);
    }

    this._sendMessageOverPorts(tabId, 'webNavigationTiming', timing);
  }

  getPageLoad(tabId) {
    if (!this.has(tabId)) {
      // log(`getPageLoad Error: TabId ${tabId} not recognized.`);
      return 0;
    }
    const { loadEventEnd, redirectStart, fetchStart } = this._tabDetails[tabId].timingPerformance;
    if (!loadEventEnd) { return 0; }
    const start = redirectStart > 0 ? redirectStart : fetchStart;
    return Math.round((loadEventEnd - start) / 10) / 100;
  }

  updateSearchResult(tabId, data) {
    if (!this.has(tabId)) {
      // log(`updateSearchResult Error: TabId ${tabId} not recognized.`);
      return;
    }
    this._sendMessageOverPorts(tabId, 'searchResultsUpdated', data);
  }
}

export default new TabDetails();
