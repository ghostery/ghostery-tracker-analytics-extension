/**
 * Settings Class
 *
 * _settings acts as a cache for lookup, preventing a call to chrome.storage.local
 *
 * Insights by Ghostery
 */

import cloneDeep from 'lodash.clonedeep';
import isObject from 'lodash.isobject';
import { log } from '../utils/common';

export const DEFAULT_SETTINGS = {
  starredTrackerIds: {},
  pageEvents: {},
  blueBarPosition: 'default',
  showBlueBar: false,
  showToasts: true,
  timelineScale: 'linear',
  infoCenterShown: false,
  tabIconExplainerAcknowledged: false,
  freeTrialStatus: null,
  endOfFreeTrialPopupAcknowledged: false,
  bugs: {},
  metrics: {},
};

class Settings {
  constructor() {
    this._settings = cloneDeep(DEFAULT_SETTINGS);
    this._initComplete = false;
    this._preInitProps = {};
  }

  show = () => {
    const { _settings, ...otherProps } = this;
    log('Settings', _settings, JSON.stringify(otherProps));
    chrome.storage.local.get(null, log);
  }

  // The Default Settings are already loaded via the Constructor.
  // This function overrides the Default Settings with Locally Stored Settings.
  // Those settings are then overwritten by Account Synched Settings.
  init() {
    return new Promise((resolve, reject) => {
      this.initFromLocalStorage()
        .then(this.initFromAccountServer)
        .then(this.completeInit)
        .then(resolve)
        .catch(reject);
    });
  }

  // Overwrite Settings with Locally Stored Settings
  initFromLocalStorage() {
    return new Promise((resolve, reject) => {
      const settings = this._settings;
      chrome.storage.local.get(null, (items) => {
        if (chrome.runtime.lastError) {
          reject();
        }
        for (const prop in items) {
          if (items.hasOwnProperty(prop) && settings.hasOwnProperty(prop)) {
            settings[prop] = items[prop];
          }
        }
        chrome.storage.local.clear();
        chrome.storage.local.set(settings);
        resolve(settings);
      });
    });
  }

  // ToDo: Overwrite Settings with Account Synched Settings
  initFromAccountServer() {
    return new Promise((resolve) => {
      resolve();
    });
  }

  completeInit = () => new Promise((resolve, reject) => {
    this.set(this._preInitProps).then(() => {
      this._initComplete = true;
      this._preInitProps = {};
      resolve();
    }).catch(reject);
  });

  // TODO always return an object, even when just a single property was requested
  get(props) {
    if (typeof props === 'undefined') {
      return this._settings;
    }
    if (typeof props === 'string') {
      return this._getSingleProp(props);
    }
    if (Array.isArray(props)) {
      const propValues = {};
      for (let i = 0; i < props.length; i++) {
        const prop = props[i];
        const value = this._getSingleProp(prop);
        if (value) {
          propValues[prop] = value;
        }
      }
      return propValues;
    }

    return undefined;
  }

  _getSingleProp(property) {
    if (this._settings.hasOwnProperty(property)) {
      return this._settings[property];
    }
    return undefined;
  }

  set(props, value) {
    const propValues = {};
    if (typeof props === 'string' && value !== 'undefined') {
      propValues[props] = value;
    }
    if (isObject(props)) {
      for (const key in props) {
        if (props.hasOwnProperty(key)) {
          propValues[key] = props[key];
        }
      }
    }
    return this._setProps(propValues);
  }

  _setProps(props) {
    return new Promise((resolve, reject) => {
      const setProps = {};
      for (const key in props) {
        if (props.hasOwnProperty(key) && this._settings.hasOwnProperty(key)) {
          this._settings[key] = props[key];
          setProps[key] = props[key];
        }
      }

      if (this._initComplete) {
        chrome.storage.local.set(setProps, () => {
          if (chrome.runtime.lastError) {
            reject();
          }
          resolve(setProps);
        });
      } else {
        this._preInitProps = setProps;
        resolve(setProps);
      }
    });
  }
}

export default new Settings();
