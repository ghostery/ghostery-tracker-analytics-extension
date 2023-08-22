/*!
 * Insights by Ghostery Background Process
 *
 * The entry point for the Insights by Ghostery Extension
 *
 * Insights by Ghostery
 * https://www.ghostery.com/insights/
 *
 * Copyright 2019 Ghostery, Inc. All rights reserved.
 * See https://www.ghostery.com/eula for license agreement.
 */

import EventHandlers from './classes/EventHandlers';
import Account from './classes/Account';
import Settings from './classes/Settings';
import BrowserAction from './classes/BrowserAction';
import Metrics from './classes/Metrics';
import BugDb from './classes/BugDb';
import Globals from './classes/Globals';
import { log } from './utils/common';

const IS_FIREFOX = (Globals.BROWSER_INFO.name === 'firefox');

/**
 * Set all the Event Listeners for the application
 */
function initializeEventListeners() {
  // All Runtime events listed
  log('Initializing the Runtime onMessage event listener');
  // chrome.runtime.onStartup
  // chrome.runtime.onInstalled
  // chrome.runtime.onSuspend
  // chrome.runtime.onSuspendCanceled
  // chrome.runtime.onUpdateAvailable
  // chrome.runtime.onBrowserUpdateAvailable
  chrome.runtime.onConnect
    .addListener(EventHandlers.onConnect.bind(EventHandlers));
  // chrome.runtime.onConnectExternal
  chrome.runtime.onMessage
    .addListener(EventHandlers.onMessage.bind(EventHandlers));
  // chrome.runtime.onMessageExternal
  // chrome.runtime.onRestartRequired

  // All Cookie events listed
  chrome.cookies.onChanged
    .addListener(EventHandlers.onCookieChanged.bind(EventHandlers));

  // All BrowserAction event listed (only 1: onClicked)
  log('Initializing the BrowserAction onClicked event listener');
  chrome.browserAction.onClicked
    .addListener(EventHandlers.onClicked.bind(EventHandlers));

  // All WebNavigation events listed
  log('Initializing WebNaviation event listeners');
  chrome.webNavigation.onBeforeNavigate
    .addListener(EventHandlers.onBeforeNavigate.bind(EventHandlers));
  chrome.webNavigation.onCommitted
    .addListener(EventHandlers.onCommitted.bind(EventHandlers));
  chrome.webNavigation.onDOMContentLoaded
    .addListener(EventHandlers.onDOMContentLoaded.bind(EventHandlers));
  chrome.webNavigation.onCompleted
    .addListener(EventHandlers.onNavigationCompleted.bind(EventHandlers));
  chrome.webNavigation.onErrorOccurred
    .addListener(EventHandlers.onNavigationErrorOccurred.bind(EventHandlers));
  // chrome.webNavigation.onCreatedNavigationTarget
  // chrome.webNavigation.onReferenceFragmentUpdated
  chrome.webNavigation.onTabReplaced
    .addListener(EventHandlers.onNavigationTabReplaced.bind(EventHandlers));
  chrome.webNavigation.onHistoryStateUpdated
    .addListener(EventHandlers.onHistoryStateUpdated.bind(EventHandlers));

  // All WebRequest events listed
  const filter = { urls: ['http://*/*', 'https://*/*'] };
  const sendHeaders = ['requestHeaders'];
  if (!IS_FIREFOX) {
    // Chromium-based browsers require `extraHeaders` to access `referrer` header data
    sendHeaders.push('extraHeaders');
  }

  log('Initializing the WebRequest event listeners');
  chrome.webRequest.onBeforeRequest
    .addListener(EventHandlers.onBeforeRequest.bind(EventHandlers), filter);
  // chrome.webRequest.onBeforeSendHeaders
  chrome.webRequest.onSendHeaders
    .addListener(EventHandlers.onSendHeaders.bind(EventHandlers), filter, sendHeaders);
  chrome.webRequest.onHeadersReceived
    .addListener(EventHandlers.onHeadersReceived.bind(EventHandlers), filter, ['responseHeaders']);
  // chrome.webRequest.onAuthRequired
  // chrome.webRequest.onResponseStarted
  chrome.webRequest.onBeforeRedirect
    .addListener(EventHandlers.onBeforeRedirect.bind(EventHandlers), filter);
  chrome.webRequest.onCompleted
    .addListener(EventHandlers.onRequestCompleted.bind(EventHandlers), filter);
  chrome.webRequest.onErrorOccurred
    .addListener(EventHandlers.onErrorOccurred.bind(EventHandlers), filter);
  // chrome.webRequest.onActionIgnored

  // All Tabs events listed
  log('Initializing the Tabs event listeners');
  chrome.tabs.onCreated
    .addListener(EventHandlers.onTabCreated.bind(EventHandlers));
  chrome.tabs.onUpdated
    .addListener(EventHandlers.onTabUpdated.bind(EventHandlers));
  // chrome.tabs.onMoved
  // chrome.tabs.onSelectionChanged
  // chrome.tabs.onActiveChanged
  chrome.tabs.onActivated
    .addListener(EventHandlers.onTabActivated.bind(EventHandlers));
  // chrome.tabs.onHighlightChanged
  // chrome.tabs.onHighlighted
  // chrome.tabs.onDetached
  // chrome.tabs.onAttached
  chrome.tabs.onRemoved
    .addListener(EventHandlers.onTabRemoved.bind(EventHandlers));
  // chrome.tabs.onReplaced
  // chrome.tabs.onZoomChange
}

/**
 * Initialize the versioning for the extension.
 * Versions saved in the metrics Settings object.
 */
function initializeVersioning() {
  log(`Initialize Versioning. Current Version: ${Globals.EXTENSION_VERSION}`);
  const metrics = Settings.get('metrics');
  const { previous_version } = metrics;

  if (!previous_version) {
    log('Initialize Versioning. New Install.');
    metrics.previous_version = Globals.EXTENSION_VERSION;

    const version_history = [];
    version_history.push(Globals.EXTENSION_VERSION);
    metrics.version_history = version_history;
    Globals.JUST_INSTALLED = true;
  } else {
    // We get here when the previous version exists, so let's check if it's an upgrade.
    log(`Initialize Versioning. Existing Version: ${previous_version}`);
    Globals.JUST_INSTALLED = false;
    Globals.JUST_UPGRADED = (previous_version !== Globals.EXTENSION_VERSION);

    if (Globals.JUST_UPGRADED) {
      log('Initialize Versioning. Upgrade.');
      metrics.previous_version = Globals.EXTENSION_VERSION;

      // Establish version history
      const { version_history } = metrics;
      version_history.push(Globals.EXTENSION_VERSION);
      metrics.version_history = version_history;
    }
  }

  return Settings.set('metrics', metrics);
}

/**
 * Send Metrics on Init
 */
function sendInitialMetrics() {
  if (Globals.JUST_UPGRADED) {
    Metrics.ping({ type: 'upgrade' });
  } else if (Globals.JUST_INSTALLED) {
    Metrics.ping({ type: 'install' });
    Metrics.setUninstallUrl();
  }
  Metrics.ping({ type: 'active' });
}

/**
 * Application Initializer
 * Called when the browser starts or the extension is installed/updated.
 *
 * ToDo: Review this function.
 *       Don't BugDb.update() here, instead add the Database using MOAB
 *       and update infrequently and on-demand.
 */
function init() {
  Promise.all([
    Settings.init().then(initializeVersioning),
    Account.checkInsightsUser(),
    BugDb.init(false),
  ]).then(() => {
    initializeEventListeners();
    BugDb.update();
    BrowserAction.updateIconForAllTabs();
    Globals.INIT_COMPLETE = true;
    Metrics.init().then(sendInitialMetrics);
  }).catch(log);
}

// Initialize the application.
init();

if (Globals.DEBUG) {
  window._Account = Account;
  window._Settings = Settings;
}
