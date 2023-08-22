/**
 * Messaging Class
 *
 * Implements the onMessage Event for Chrome's Runtime API
 *
 * Documentation:
 *   https://developer.chrome.com/extensions/runtime
 *
 * Insights by Ghostery
 */

import TabDetails from './TabDetails';
import RequestDetails from './RequestDetails';
import Account from './Account';
import Globals from './Globals';
import Settings from './Settings';
import BrowserAction from './BrowserAction';
import BugDb from './BugDb';
import Metrics from './Metrics';
import Tabs from './Tabs';
import { getQueryParam } from '../utils/utils';
import { log } from '../utils/common';
import { parseAllDataForDownload, downloadFilesWithTimestamp } from '../utils/download';

const { GHOSTERY_DOMAIN } = Globals;

class Messaging {
  // Chrome's runtime.onConnect handler
  onConnect(port) {
    switch (port.name) {
      case 'window': {
        const tabId = port.sender.tab.id;
        TabDetails.setPort(tabId, 'window', port);
        port.onMessage.addListener(this.onPortMessageWindow.bind(this));
        port.onDisconnect.addListener(this.onPortDisconnectWindow.bind(this));
        Account.checkAccessCookie();
        break;
      }
      case 'app': {
        const appTabId = port.sender.tab.id;
        const tabId = +getQueryParam(port.sender.url, 'parentTabId');
        TabDetails.setPort(tabId, 'app', port);
        TabDetails.setAppDetails(tabId, { appTabId });
        port.onMessage.addListener(this.onPortMessageApp.bind(this));
        port.onDisconnect.addListener(this.onPortDisconnectApp.bind(this));
        Account.checkAccessCookie();
        break;
      }
      default: {
        log(`onConnect Error: Port Name ${port.name} not recognized.`);
        break;
      }
    }
  }

  updateApp(userInfo) {
    BrowserAction.updateIconForCurrentTab();
    TabDetails.updateUserInfo(userInfo);
  }

  switchPortMessage(message, port, tabs) {
    const responseMessage = (type, data) => port.postMessage({ type, data });

    switch (message.type) {
      // Used by both App and Window
      case 'OpenTab': {
        Tabs.create({
          url: message.data,
          active: true,
        });
        break;
      }
      case 'Login': {
        Account.login(message.data, responseMessage);
        break;
      }
      case 'Register': {
        Account.register(message.data, responseMessage);
        break;
      }
      case 'ResetPassword': {
        Account.resetPassword(message.data, responseMessage);
        break;
      }
      case 'Logout': {
        Account.logout();
        break;
      }
      case 'SendEmailVerification': {
        Account.sendEmailVerification(responseMessage);
        break;
      }
      case 'Metrics': {
        Metrics.ping(message.data);
        break;
      }
      case 'SetIsLive': {
        TabDetails.setIsLive(tabs.windowTabId, message.data);
        break;
      }
      case 'SetPrefs': {
        Settings.set(message.data).then((data) => {
          TabDetails.updateSettings(data);
        });
        break;
      }
      case 'UpdateTrackerStar': {
        const starredTrackerIds = Settings.get('starredTrackerIds');
        const { trackerId, trackerName, action } = message.data;
        if (action === 'addStar') {
          starredTrackerIds[trackerId] = trackerName;
        } else if (action === 'removeStar') {
          delete starredTrackerIds[trackerId];
        }
        Settings.set({ starredTrackerIds }).then((data) => {
          TabDetails.updateSettings(data);
        });
        break;
      }
      case 'UpdatePageEvent': {
        const pageEvents = Settings.get('pageEvents');
        const { pageEvent, action } = message.data;
        if (action === 'addPageEvent') {
          pageEvents[pageEvent] = true;
        } else if (action === 'removePageEvent') {
          delete pageEvents[pageEvent];
        }
        Settings.set({ pageEvents }).then((data) => {
          TabDetails.updateSettings(data);
        });
        break;
      }
      case 'RequestDataFiles': {
        const settings = Settings.get();
        const tabDetails = TabDetails.getTabDetails(tabs.windowTabId);
        const { data, parentTabHostName } = parseAllDataForDownload(settings, tabDetails);
        downloadFilesWithTimestamp(data, parentTabHostName);
        break;
      }
      case 'SearchBugDb': {
        const result = BugDb.searchTrackerName(message.data.toLowerCase());
        TabDetails.updateSearchResult(tabs.windowTabId, result);
        break;
      }
      case 'OpenProductTour': {
        Tabs.createOrFocusTab('infoCenter', 1);
        break;
      }
      case 'OpenGlossary': {
        Tabs.createOrFocusTab('infoCenter', 2);
        break;
      }
      case 'OpenLicenses': {
        Tabs.createOrFocusTab('licenses');
        break;
      }
      case 'BeginSubscription': {
        Tabs.create({
          url: `https://${GHOSTERY_DOMAIN}.com/become-a-contributor`,
          active: true,
        });
        break;
      }
      case 'RequestTabDetails': {
        const data = TabDetails.getTabDetails(tabs.windowTabId);
        port.postMessage({ type: 'TabDetails', data });
        break;
      }
      case 'RequestSettings': {
        port.postMessage({ type: 'Settings', data: Settings.get() });
        break;
      }
      case 'RequestEndOfFreeTrialPopup': {
        if (Account.showEndOfFreeTrialPopup()) {
          port.postMessage({ type: 'InjectEndOfFreeTrialPopup' });
        }
        break;
      }
      case 'MarkEndOfFreeTrialPopupAcknowledged': {
        Settings.set('endOfFreeTrialPopupAcknowledged', true);
        break;
      }
      case 'RequestUserInfo': {
        Account.sendUserInfo(responseMessage, this.updateApp);
        break;
      }
      case 'UpdateUserInfo': {
        Account.updateAndSendUserInfo(responseMessage, this.updateApp);
        break;
      }

      // Used only by Window
      case 'MarkTabIconExplainerAcknowledged': {
        Settings.set('tabIconExplainerAcknowledged', true);
        port.postMessage({
          type: 'SettingsUpdated',
          data: { tabIconExplainerAcknowledged: Settings.get('tabIconExplainerAcknowledged') },
        });
        break;
      }
      case 'OpenApp': {
        TabDetails.openApp(tabs.windowTabId, message.data);
        break;
      }
      case 'TogglePanel': {
        TabDetails.togglePanel(tabs.windowTabId);
        break;
      }
      case 'PanelStylesLoaded': {
        port.postMessage({ type: 'PanelStylesLoaded' });
        break;
      }

      // Used only by App
      case 'FocusParentTab': {
        Tabs.focusTabById(tabs.windowTabId);
        break;
      }
      case 'RequestTrackerParentage': {
        const trackerParentageData = RequestDetails.getTrackerParentage(tabs.windowTabId);
        responseMessage('UpdateTrackerParentage', trackerParentageData);
        break;
      }

      default: {
        if (tabs.appTabId) {
          log(`Port Message from App ${tabs.appTabId} with Parent ${tabs.windowTabId}`, message);
        } else {
          log(`Port Message from Window with TabId ${tabs.windowTabId}`, message);
        }
        break;
      }
    }
  }

  onPortMessageWindow(message, port) {
    const tabs = {
      windowTabId: port.sender.tab.id,
    };
    this.switchPortMessage(message, port, tabs);
  }

  onPortDisconnectWindow(port) {
    const tabId = port.sender.tab.id;
    TabDetails.setPort(tabId, 'window', null);
    // log('Window Port Disconnecting!!!', port);
  }

  onPortMessageApp(message, port) {
    const tabs = {
      appTabId: port.sender.tab.id,
      windowTabId: +getQueryParam(port.sender.url, 'parentTabId'),
    };
    this.switchPortMessage(message, port, tabs);
  }

  onPortDisconnectApp(port) {
    const tabId = +getQueryParam(port.sender.url, 'parentTabId');
    TabDetails.setPort(tabId, 'app', null);
    TabDetails.setAppDetails(tabId, { opened: false });
    // log('App Port Disconnecting!!!', port);
  }


  // Chrome's runtime.onMessage handler
  onMessage(message, sender) {
    const tabId = sender.tab.id;
    switch (message.type) {
      case 'debug': {
        log(`debugging called from TabId ${tabId}`);
        TabDetails.log();
        RequestDetails.log();
        Account.log();
        return true;
      }
      case 'reloadTab': {
        Tabs.reload(tabId);
        return true;
      }
      case 'timingPerformance': {
        const { timing } = message;
        TabDetails.setPerformance(tabId, timing);
        BrowserAction.updateIconForCurrentTab();
        return true;
      }
      case 'togglePanel': {
        TabDetails.togglePanel(tabId);
        return true;
      }
      default: {
        log(`Message Type ${message.type} not recognized.`, message);
        return true;
      }
    }
  }
}

// return the class as a singleton
export default new Messaging();
