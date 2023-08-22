/**
 * Requests By Type Class
 *
 * Keeps track of RequestsByType organized by Tab.
 *
 *  this._requestsByType[type]  {Object} Details for each Request Type per tab.
 *    { count, size, latency } added for each Type and for _total & _tracker.
 *    { tracker_count, tracker_size, tracker_latency } added for Types with Trackers.
 *
 * Insights by Ghostery
 */

import cloneDeep from 'lodash.clonedeep';
import { log } from '../utils/common';

class RequestsByType {
  constructor() {
    this._requestsByType = {};
  }

  log() {
    log('RequestsByType _requestsByType', this._requestsByType);
  }

  create(tabId) {
    if (this._requestsByType.hasOwnProperty(tabId)) {
      log(`create Error: ${tabId} already exists on RequestsByType.`);
      return;
    }

    this._requestsByType[tabId] = {
      _total: { count: 0, size: 0, latency: 0 },
      _tracker: { count: 0, size: 0, latency: 0 },
    };
  }

  remove(tabId) {
    if (!this._requestsByType.hasOwnProperty(tabId)) {
      // log(`remove Error: TabId ${tabId} not recognized on RequestsByType.`);
      return;
    }

    delete this._requestsByType[tabId];
  }

  _initializeType(tabId, { type, isTracker }) {
    if (!this._requestsByType.hasOwnProperty(tabId)) {
      log(`_initializeType Error: TabId ${tabId} not recognized.`);
      return false;
    }

    if (!this._requestsByType[tabId].hasOwnProperty(type)) {
      this._requestsByType[tabId][type] = { count: 0, size: 0, latency: 0 };
    }
    if (isTracker) {
      if (!this._requestsByType[tabId][type].hasOwnProperty('tracker_count')) {
        this._requestsByType[tabId][type].tracker_count = 0;
        this._requestsByType[tabId][type].tracker_size = 0;
        this._requestsByType[tabId][type].tracker_latency = 0;
      }
    }

    return true;
  }

  addDelta(tabId, property, { type, isTracker, delta = 0 }) {
    if (!this._initializeType(tabId, { type, isTracker })) { return; }
    if (!['count', 'size', 'latency'].includes(property)) { return; }

    this._requestsByType[tabId]._total[property] += delta;
    this._requestsByType[tabId][type][property] += delta;
    if (isTracker) {
      this._requestsByType[tabId]._tracker[property] += delta;
      this._requestsByType[tabId][type][`tracker_${property}`] += delta;
    }
  }

  getTypes(tabId, types = []) {
    if (!this._requestsByType.hasOwnProperty(tabId)) {
      log(`getTypes Error: TabId ${tabId} not recognized.`);
      return {};
    }

    types.push('_total', '_tracker');
    const data = {};
    for (let i = 0; i < types.length; i++) {
      const type = types[i];
      data[type] = cloneDeep(this._requestsByType[tabId][type]);
    }
    return data;
  }

  getAllTypes(tabId) {
    if (!this._requestsByType.hasOwnProperty(tabId)) {
      log(`getAllTypes Error: TabId ${tabId} not recognized.`);
      return {};
    }

    return cloneDeep(this._requestsByType[tabId]);
  }
}

export default new RequestsByType();
