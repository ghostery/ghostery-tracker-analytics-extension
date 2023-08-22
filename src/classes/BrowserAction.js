/**
 * Browser Action Class
 *
 * Implements the method calls for Chrome's BrowserAction API
 *   chrome.browserAction
 *
 * Documentation:
 *   https://developer.chrome.com/extensions/browserAction
 *
 * Insights by Ghostery
 */

import Account from './Account';
import TabDetails from './TabDetails';
import Tabs from './Tabs';

class BrowserButton {
  // Private methods
  _setText(tabId, text) {
    if (!tabId) {
      return;
    }

    chrome.browserAction.setBadgeText({ text, tabId });
  }

  _updateText(tabId) {
    const pageLoad = TabDetails.getPageLoad(tabId) || '';
    this._setText(tabId, pageLoad.toString());
  }

  _getPath(icon) {
    return {
      19: `/dist/images/logo-icons/icon${icon}19.png`,
      38: `/dist/images/logo-icons/icon${icon}38.png`,
    };
  }

  _getIcon(id, url, pendingUrl) {
    let icon = '';
    if (!Account.isSignedIn()) {
      icon = '_lock';
    } else if (Account.isTrialExpired()) {
      icon = '_endOfTrialAlert';
    } else if (url && url.startsWith('chrome-extension')) {
      icon = '_reloadAlert';
    } else if (pendingUrl && pendingUrl.startsWith('chrome-extension')) {
      icon = '';
    } else if (url && url.startsWith('chrome')) {
      icon = '_reloadAlert';
    } else if (pendingUrl && pendingUrl.startsWith('chrome')) {
      icon = '_reloadAlert';
    } else if (TabDetails.needsReload(id)) {
      icon = '_reloadAlert';
    }

    if (icon === '') {
      this._updateText(id);
    } else {
      this.clearText(id);
    }
    return icon;
  }

  _setIconForCurrentTab(icon, tabId) {
    const path = this._getPath(icon);
    chrome.browserAction.setIcon({
      tabId,
      path,
    });
  }

  // Public methods
  updateIconForCurrentTab() {
    Tabs.getActiveTab().then((tab) => {
      if (!tab) {
        return;
      }
      const { id, url, pendingUrl } = tab;
      const icon = this._getIcon(id, url, pendingUrl);
      this._setIconForCurrentTab(icon, id);
    });
  }

  updateIconForAllTabs() {
    Tabs.getActiveTabsAllWindows().then((activeTabs) => {
      activeTabs.forEach((activeTab) => {
        const { id, url, pendingUrl } = activeTab;
        const icon = this._getIcon(id, url, pendingUrl);
        this._setIconForCurrentTab(icon, id);
      });
    });
  }

  clearText(tabId) {
    this._setText(tabId, '');
  }
}

// return the class as a singleton
export default new BrowserButton();
