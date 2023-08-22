/**
 * Event Handlers Class
 *
 * Implements the Events for the following Chrome's APIs:
 *   chrome.runtime
 *   chrome.cookies
 *   chrome.browserAction
 *   chrome.webNavigation
 *   chrome.webRequest
 *   chrome.tabs
 *
 * Documentation:
 *   https://developer.chrome.com/extensions/runtime
 *   https://developer.chrome.com/extensions/cookies
 *   https://developer.chrome.com/extensions/browserAction
 *   https://developer.chrome.com/extensions/webNavigation
 *   https://developer.chrome.com/extensions/webRequest
 *   https://developer.chrome.com/extensions/tabs
 *
 * Insights by Ghostery
 */

/* eslint no-unused-vars: 0 */

import throttle from 'lodash.throttle';
import Messaging from './Messaging';
import BrowserAction from './BrowserAction';
import Account from './Account';
import TabDetails from './TabDetails';
import RequestDetails from './RequestDetails';
import Tabs from './Tabs';
import Globals from './Globals';
import Metrics from './Metrics';
import Settings from './Settings';
import { isValidTopLevelNavigation, processUrl, isValidUrl } from '../utils/utils';
import { log } from '../utils/common';

const {
  GHOSTERY_DOMAIN,
} = Globals;

class EventHandlers {
  // Determines whether it is valid for us to inject scripts into this tab
  _validForScriptInjection(id, url) {
    const details = {
      url,
      tabId: id,
      frameId: 0,
    };

    return (
      isValidTopLevelNavigation(details)
      && isValidUrl(processUrl(url))
    );
  }

  // Event Handlers for chrome.runtime
  onConnect(port) {
    Messaging.onConnect(port);
  }

  onMessage(message, sender, sendResponse) {
    Messaging.onMessage(message, sender, sendResponse);
  }

  // Event Handlers for chrome.cookies
  onCookieChanged({ removed, cookie, cause }) {
    const { domain, name } = cookie;

    const cookiesToWatch = ['user_id', 'access_token'];
    if (domain.includes(GHOSTERY_DOMAIN) && cookiesToWatch.includes(name)) {
      if (name === 'user_id' && !removed && cause === 'explicit') {
        Metrics.ping({ type: 'sign_in_success' });
      }
      this.throttleWatchedCookieChanged();
    }
  }

  throttleWatchedCookieChanged = throttle(() => {
    Account.checkInsightsUser().then(() => {
      Messaging.updateApp(Account.getUserInfo());
    });
  }, 100, { leading: false, trailing: true });

  // Event Handlers for chrome.browserAction
  onClicked({ id, url }) {
    Metrics.ping({ type: 'engaged' });

    // Tab and request details might not exist yet
    // if the tab opened as part of launching a new browser session
    if (!TabDetails.has(id)) {
      TabDetails.create(id, true);
      RequestDetails.create(id);
      BrowserAction.updateIconForCurrentTab();
    }

    if (!this._validForScriptInjection(id, url)) {
      TabDetails.openApp(id);
      return;
    }

    if (TabDetails.hasReloadPopup(id)) {
      chrome.tabs.sendMessage(id, { type: 'RepopReloadPopup' });
    } else if (TabDetails.needsReload(id)) {
      TabDetails.injectScript(id, 'injectReloadPopup');
    } else {
      TabDetails.togglePanel(id);
    }
  }

  // Event Handlers for chrome.webNavigation
  onBeforeNavigate(details) {
    const eventName = 'onBeforeNavigate';
    const { frameId, tabId, timeStamp, url } = details;
    if (frameId !== 0) { return; }
    if (!this._validForScriptInjection(tabId, url)) {
      BrowserAction.updateIconForCurrentTab();
      TabDetails.setParsedUrl(tabId, url, timeStamp);
      return;
    }

    // log(`WebNavigation event ${eventName}`, details);
    BrowserAction.clearText(tabId);
    TabDetails.clear(tabId);
    TabDetails.setWebNavigation(tabId, eventName, timeStamp);
    TabDetails.setParsedUrl(tabId, url, timeStamp);
    RequestDetails.remove(tabId);
    RequestDetails.create(tabId);

    // ToDo: Update, Uncomment, or Remove
    // // Workaround for foundBugs/TabInfo memory leak when the user triggers
    // // prefetching/prerendering but never loads the page. Wait two minutes
    // // and check whether the tab doesn't exist.
    // setTimeout(() => {
    //   Tabs.get(tabId).catch(() => {
    //     TabDetails.clear(tabId);
    //     RequestDetails.remove(tabId);
    //   });
    // }, 120000);
  }

  onCommitted({ frameId, tabId, timeStamp, url }) {
    const eventName = 'onCommitted';
    if (frameId !== 0) { return; }

    // log(`WebNavigation event ${eventName}`, details);
    TabDetails.setWebNavigation(tabId, eventName, timeStamp);

    if (!isValidUrl(processUrl(url))) { return; }

    if (!TabDetails.needsReload(tabId)) {
      TabDetails.injectScript(tabId, 'performance');
      TabDetails.injectScript(tabId, 'injectionControl');
    }
  }

  onDOMContentLoaded({ frameId, tabId, timeStamp }) {
    const eventName = 'onDOMContentLoaded';
    if (frameId !== 0) { return; }

    // log(`WebNavigation event ${eventName}`, details);
    TabDetails.setWebNavigation(tabId, eventName, timeStamp);
  }

  onNavigationCompleted({ frameId, tabId, timeStamp }) {
    const eventName = 'onCompleted';
    if (frameId !== 0) { return; }

    // log(`WebNavigation event ${eventName}`, details);
    TabDetails.setWebNavigation(tabId, eventName, timeStamp);
  }

  onNavigationErrorOccurred(details) {
    const eventName = 'onErrorOccurred';
    // log(`WebNavigation event ${eventName}`, details);
  }

  onNavigationTabReplaced(details) {
    const eventName = 'onTabReplaced';
    const { frameId, tabId, timeStamp } = details;
    if (frameId !== 0) { return; }

    log(`WebNavigation event ${eventName}`, details);
    TabDetails.setWebNavigation(tabId, eventName, timeStamp);
  }

  onHistoryStateUpdated({ frameId, tabId, timeStamp }) {
    const eventName = 'onHistoryStateUpdated';
    if (frameId !== 0) { return; }

    // log(`WebNavigation event ${eventName}`, details);
    TabDetails.setWebNavigation(tabId, eventName, timeStamp);
  }


  // Event Handlers for chrome.webRequest
  onBeforeRequest(details) {
    // const eventName = 'onBeforeRequest';
    // log(`WebRequest event ${eventName}`, details);
    RequestDetails.initRequest(details);
    BrowserAction.updateIconForCurrentTab();
  }

  onSendHeaders(details) {
    // const eventName = 'onSendHeaders';
    // log(`WebRequest event ${eventName}`, details);
    RequestDetails.findRefererHeader(details);
  }

  onHeadersReceived(details) {
    // const eventName = 'onHeadersReceived';
    // log(`WebRequest event ${eventName}`, details);
    RequestDetails.updateRequest(details);
  }

  onBeforeRedirect(details) {
    // const eventName = 'onBeforeRequest';
    // log(`WebRequest event ${eventName}`, details);
    RequestDetails.deleteRequest(details);
  }

  onRequestCompleted(details) {
    // const eventName = 'onCompleted';
    // log(`WebRequest event ${eventName}`, details);
    RequestDetails.completeRequest(details);
  }

  onErrorOccurred(details) {
    // const eventName = 'onError';
    // log(`WebRequest event ${eventName}`, details);
    RequestDetails.completeRequest(details);
  }

  // Event Handlers for chrome.tabs
  onTabCreated({ id, url }) {
    if (!this._validForScriptInjection(id, url)) return;

    TabDetails.create(id);
    RequestDetails.create(id);
  }

  onTabUpdated(tabId, changeInfo, tab) {
    if (changeInfo.hasOwnProperty('url')) {
      const { url } = changeInfo;
      const timeStamp = (new Date()).getTime();
      TabDetails.setParsedUrl(tabId, url, timeStamp);
    }
  }

  onTabActivated({ tabId, windowId }) {
    // Tab and request details might not exist yet
    // if the user had it open before installing Insights
    if (!TabDetails.has(tabId)) {
      TabDetails.create(tabId, true);
      RequestDetails.create(tabId);
    }
    BrowserAction.updateIconForCurrentTab();
  }

  onTabRemoved(removedId, removedInfo) {
    TabDetails.remove(removedId);
    RequestDetails.remove(removedId);
  }

  // ToDo: Update or Remove
  // onTabReplaced(addedTabId, removedTabId) {}
}

// return the class as a singleton
export default new EventHandlers();
