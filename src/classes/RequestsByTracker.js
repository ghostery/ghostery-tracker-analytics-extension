/**
 * Requests By Tracker Class
 *
 * Keeps track of RequestsByTracker organized by Tab.
 *
 *  this._requestsByTracker {Object}  Details for each Tracker per tab.
 *    { name, category, count, size, latency, completedRequests } added for each Tracker.
 *    completedRequests {Array} Array of the src details that make up a Tracker
 *      { startTime, endTime, requestId }
 *
 * Insights by Ghostery
 */

import cloneDeep from 'lodash.clonedeep';
import BugDb from './BugDb';
import { log } from '../utils/common';

class RequestsByTracker {
  constructor() {
    this._requestsByTracker = {};
  }

  log() {
    log('RequestsByTracker _requestsByTracker', this._requestsByTracker);
  }

  create(tabId) {
    if (this._requestsByTracker.hasOwnProperty(tabId)) {
      log(`create Error: ${tabId} already exists on RequestsByTracker.`);
      return;
    }

    this._requestsByTracker[tabId] = {};
  }

  remove(tabId) {
    if (!this._requestsByTracker.hasOwnProperty(tabId)) {
      // log(`remove Error: TabId ${tabId} not recognized on RequestsByTracker.`);
      return;
    }

    delete this._requestsByTracker[tabId];
  }

  _initializeTracker(tabId, trackerId) {
    if (!trackerId) { return false; }
    if (!this._requestsByTracker.hasOwnProperty(tabId)) {
      log(`_initializeTracker Error: TabId ${tabId} not recognized.`);
      return false;
    }

    if (!this._requestsByTracker[tabId].hasOwnProperty(trackerId)) {
      const name = BugDb.getTrackerName(trackerId);
      const category = BugDb.getTrackerCategory(trackerId);
      this._requestsByTracker[tabId][trackerId] = {
        name,
        category,
        count: 0,
        size: 0,
        latency: 0,
        completedRequests: [],
      };
    }

    return true;
  }

  addDelta(tabId, property, { trackerId, delta = 0 }) {
    if (!this._initializeTracker(tabId, trackerId)) { return; }
    if (!['count', 'size', 'latency'].includes(property)) { return; }

    this._requestsByTracker[tabId][trackerId][property] += delta;
  }

  addCompletedRequest(tabId, { ...data }) {
    const { trackerId } = data;
    if (!this._initializeTracker(tabId, trackerId)) { return; }

    this._requestsByTracker[tabId][trackerId].completedRequests.push({ ...data });
  }

  getTrackers(tabId, trackerIds = []) {
    if (!this._requestsByTracker.hasOwnProperty(tabId)) {
      log(`getTrackers Error: TabId ${tabId} not recognized.`);
      return {};
    }

    const data = {};
    for (let i = 0; i < trackerIds.length; i++) {
      const trackerId = trackerIds[i];
      data[trackerId] = cloneDeep(this._requestsByTracker[tabId][trackerId]);
    }
    return data;
  }

  getAllTrackers(tabId) {
    if (!this._requestsByTracker.hasOwnProperty(tabId)) {
      log(`getAllTrackers Error: TabId ${tabId} not recognized.`);
      return {};
    }

    return cloneDeep(this._requestsByTracker[tabId]);
  }

  countAllTrackers(tabId) {
    if (!this._requestsByTracker.hasOwnProperty(tabId)) {
      log(`countAllTrackers Error: TabId ${tabId} not recognized.`);
      return 0;
    }

    return Object.keys(this._requestsByTracker[tabId]).length;
  }
}

export default new RequestsByTracker();
