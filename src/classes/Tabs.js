/**
 * Tabs Class
 *
 * Calls the Methods for Chrome's Tabs API
 *  chrome.tabs
 *
 * Documentation:
 *   https://developer.chrome.com/extensions/tabs
 *
 * Insights by Ghostery
 */

class Tabs {
  // Helper functions that call chrome.tabs
  create(createProperties) {
    return new Promise((resolve) => {
      chrome.tabs.create(createProperties, resolve);
    });
  }

  reload(tabId) {
    return new Promise((resolve) => {
      chrome.tabs.reload(tabId, resolve);
    });
  }

  createInsightsApp(tabId, insightsInnerTab = 1) {
    this.get(tabId).then((tab) => {
      this.create({
        url: `/dist/insights/index.html?parentTabId=${tab.id}#tab=${insightsInnerTab}`,
        active: true,
        windowId: tab.windowId,
        index: tab.index + 1,
      });
    });
  }

  // createOrFocusTab helper
  _getLocationUrlInfo(location, innerTab) {
    const infoCenter = {
      urlRegex: /chrome-extension:\/\/.*\/dist\/infoCenter\/index\.html.*/,
      urlToCreate: `/dist/infoCenter/index.html#tab=${innerTab}`,
    };

    switch (location) {
      case 'infoCenter':
        return infoCenter;
      case 'licenses':
        return {
          urlRegex: /chrome-extension:\/\/.*\/dist\/licenses\/index\.html.*/,
          urlToCreate: '/dist/licenses/index.html',
        };
      default:
        return infoCenter;
    }
  }

  createOrFocusTab(location, innerTab) {
    chrome.tabs.query({}, (openTabs) => {
      const { urlRegex, urlToCreate } = this._getLocationUrlInfo(location, innerTab);
      const matchingTab = openTabs.find(openTab => openTab.url.match(urlRegex));
      if (matchingTab) {
        this.focusTabById(matchingTab.id, innerTab);
      } else {
        this.create({ url: urlToCreate, active: true });
      }
    });
  }

  get(tabId) {
    return new Promise((resolve, reject) => {
      chrome.tabs.get(tabId, (tab) => {
        if (chrome.runtime.lastError) {
          return reject(chrome.runtime.lastError);
        }
        if (tab) {
          return resolve(tab);
        }
        return reject(tabId);
      });
    });
  }

  getActiveTab() {
    return new Promise((resolve) => {
      chrome.tabs.query({
        active: true,
        currentWindow: true,
      }, tabs => resolve(tabs[0]));
    });
  }

  getActiveTabsAllWindows() {
    return new Promise((resolve) => {
      chrome.tabs.query({
        active: true,
      }, tabs => resolve(tabs));
    });
  }

  focusTabById(tabId, insightsInnerTab) {
    return new Promise((resolve, reject) => {
      chrome.tabs.get(tabId, (tab) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
          return;
        }

        if (insightsInnerTab) {
          const updatedUrlHash = tab.url.replace(/(tab=.)/, `tab=${insightsInnerTab}`);
          chrome.tabs.update(tab.id, { url: updatedUrlHash });
        }

        chrome.windows.update(tab.windowId, { focused: true });
        chrome.tabs.highlight({
          windowId: tab.windowId,
          tabs: tab.index,
        }, resolve);
      });
    });
  }

  executeScript(tabId, scriptFile) {
    chrome.tabs.executeScript(tabId, {
      file: scriptFile,
    });
  }
}

// return the class as a singleton
export default new Tabs();
