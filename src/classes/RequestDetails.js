/**
 * Request Details Class
 *
 * Keeps track of Requests organized by Tab.
 *
 *  this._requestDetails  {Object}  Details for all the requests per tab.
 *    { src, type, startTime, trackerId, trackerName, frameId, initiator }
 *    ^ added on initRequest
 *
 *    { size, headersTime }
 *    ^ added on updateRequest
 *
 *    redirect parentage in _parentageData.links
 *    ^ added on deleteRequest
 *
 *    { latency, endTime }
 *    initiator and fallback parentage in _parentageData.links
 *    ^ added on completeRequest
 *
 * Insights by Ghostery
 */

import cloneDeep from 'lodash.clonedeep';
import BugDb from './BugDb';
import TabDetails from './TabDetails';
import RequestsByTracker from './RequestsByTracker';
import RequestsByType from './RequestsByType';
import { processUrl } from '../utils/utils';
import { getTrackerId } from '../utils/matcher';
import { log } from '../utils/common';

class RequestDetails {
  constructor() {
    this._requestDetails = {};

    this._urlToRequestId = {};
    this._originToRequestId = {};
    this._frameIdToRequestId = {};
    this._parentageData = {};
  }

  log() {
    log('RequestDetails _requestDetails', this._requestDetails);
    RequestsByTracker.log();
    RequestsByType.log();

    log('RequestDetails _urlToRequestId', this._urlToRequestId);
    log('RequestDetails _originToRequestId', this._originToRequestId);
    log('RequestDetails _frameIdToRequestId', this._frameIdToRequestId);
  }

  create(tabId) {
    if (this._requestDetails.hasOwnProperty(tabId)) {
      log(`create Error: ${tabId} already exists on RequestDetails.`);
      return;
    }

    this._requestDetails[tabId] = {};

    this._urlToRequestId[tabId] = new Map();
    this._originToRequestId[tabId] = new Map();
    this._frameIdToRequestId[tabId] = new Map();
    this._parentageData[tabId] = { nodes: [], links: [] };

    RequestsByTracker.create(tabId);
    RequestsByType.create(tabId);
  }

  remove(tabId) {
    if (!this._requestDetails.hasOwnProperty(tabId)) {
      // log(`remove Error: TabId ${tabId} not recognized on RequestDetails.`);
    }

    delete this._requestDetails[tabId];

    delete this._urlToRequestId[tabId];
    delete this._originToRequestId[tabId];
    delete this._frameIdToRequestId[tabId];
    delete this._parentageData[tabId];

    RequestsByTracker.remove(tabId);
    RequestsByType.remove(tabId);
  }

  gateRequestHandler(tabId, requestId, update) {
    if (!this._requestDetails.hasOwnProperty(tabId)) {
      // log(`initRequest Error: TabId ${tabId} not recognized.`);
      return false;
    }
    if (!update && this._requestDetails[tabId].hasOwnProperty(requestId)) {
      // log(`initRequest Error: ${requestId} already exists for TabId ${tabId}.`);
      return false;
    }
    if (update && !this._requestDetails[tabId].hasOwnProperty(requestId)) {
      // log(`initRequest Error: ${requestId} already exists for TabId ${tabId}.`);
      return false;
    }
    return true;
  }

  initRequest({
    tabId, requestId, url, type, timeStamp, initiator = '', frameId, parentFrameId,
  }) {
    if (this.gateRequestHandler(tabId, requestId, false) === false) { return; }

    const trackerId = getTrackerId(url);
    const trackerName = BugDb.getTrackerName(trackerId) || '';
    const requestDetails = {
      startTime: timeStamp,
      src: url,
      type: type === 'imageset' ? 'image' : type,
      trackerId,
      trackerName,
      frameId,
      parentFrameId,
      initiator,
    };
    this._requestDetails[tabId][requestId] = requestDetails;

    if (!this._urlToRequestId[tabId].has(url)) {
      this._urlToRequestId[tabId].set(url, requestId);
    }

    const { protocol, host } = processUrl(url);
    const origin = `${protocol}://${host}`;
    if (!this._originToRequestId[tabId].has(origin)) {
      this._originToRequestId[tabId].set(origin, requestId);
    }

    if (!this._frameIdToRequestId[tabId].has(frameId)) {
      this._frameIdToRequestId[tabId].set(frameId, requestId);
    }

    RequestsByTracker.addDelta(tabId, 'count', { trackerId, delta: 1 });
    RequestsByType.addDelta(tabId, 'count', { type, isTracker: (trackerId), delta: 1 });
    TabDetails.sendRequestsByTracker(tabId, trackerId, timeStamp);
    TabDetails.sendRequestsByType(tabId, type);

    if (type === 'main_frame') {
      this._parentageData[tabId].nodes.unshift({ requestId, ...requestDetails });
    }
  }

  deleteRequest({ tabId, requestId, timeStamp }) {
    // If we want to represent redirected requests as nodes/links in the
    // Tracker Parentage graph, we will need to not delete these requests here,
    // force them to complete, and add a "Redirect" link to the _parentageData

    // ToDo: Change this to recordRedirect and keep track of redirect counts and timestamps
    if (this.gateRequestHandler(tabId, requestId, true) === false) { return; }

    const { type, trackerId, size, latency } = this._requestDetails[tabId][requestId];
    RequestsByTracker.addDelta(tabId, 'count', { trackerId, delta: -1 });
    RequestsByType.addDelta(tabId, 'count', { type, isTracker: (trackerId), delta: -1 });
    if (size) {
      // log(`deleteRequest: Removing size data for RequestId ${requestId}`);
      RequestsByTracker.addDelta(tabId, 'size', { trackerId, delta: -size });
      RequestsByType.addDelta(tabId, 'size', { type, isTracker: (trackerId), delta: -size });
    }
    if (latency) {
      log(`deleteRequest: Removing latency data for RequestId ${requestId}`);
      RequestsByTracker.addDelta(tabId, 'latency', { trackerId, delta: -latency });
      RequestsByType.addDelta(tabId, 'latency', { type, isTracker: (trackerId), delta: -latency });
    }

    TabDetails.sendRequestsByTracker(tabId, trackerId, timeStamp);
    TabDetails.sendRequestsByType(tabId, type);
    delete this._requestDetails[tabId][requestId];
  }

  findRefererHeader({ tabId, requestId, requestHeaders = {} }) {
    if (this.gateRequestHandler(tabId, requestId, true) === false) { return; }

    let refererUrl = '';
    for (let i = 0; i < requestHeaders.length; i++) {
      const header = requestHeaders[i];
      if (header.name.match(/^referer$/gi)) {
        refererUrl = header.value;
        break;
      }
    }

    const requestData = this._requestDetails[tabId][requestId];
    requestData.refererUrl = refererUrl;
  }

  updateRequest({ tabId, requestId, timeStamp, responseHeaders }) {
    if (this.gateRequestHandler(tabId, requestId, true) === false) { return; }

    const request = this._requestDetails[tabId][requestId];
    request.headersTime = timeStamp;
    for (let i = 0; i < responseHeaders.length; i++) {
      const header = responseHeaders[i];
      if (header.name.toLowerCase() === 'content-length') {
        request.size = +header.value;
        break;
      }
    }

    const { type, trackerId, size } = request;
    RequestsByTracker.addDelta(tabId, 'size', { trackerId, delta: size });
    RequestsByType.addDelta(tabId, 'size', { type, isTracker: (trackerId), delta: size });
    TabDetails.sendRequestsByTracker(tabId, trackerId, timeStamp);
    TabDetails.sendRequestsByType(tabId, type);
  }

  completeRequest({ tabId, requestId, timeStamp, error = null }) {
    if (this.gateRequestHandler(tabId, requestId, true) === false) { return; }

    const request = this._requestDetails[tabId][requestId];
    request.endTime = timeStamp;
    request.latency = request.endTime - request.startTime;
    request.error = error;

    const { type, trackerId, latency } = request;
    RequestsByTracker.addDelta(tabId, 'latency', { trackerId, delta: latency });
    RequestsByTracker.addCompletedRequest(tabId, { requestId, ...request });
    RequestsByType.addDelta(tabId, 'latency', { type, isTracker: (trackerId), delta: latency });
    TabDetails.sendRequestsByTracker(tabId, trackerId, timeStamp);
    TabDetails.sendRequestsByType(tabId, type);

    this.buildParentageData({ tabId, requestId, type });
  }

  buildParentageData({ tabId, requestId, type }) {
    const requestData = this._requestDetails[tabId][requestId];
    const parentageData = this._parentageData[tabId];

    if (type === 'main_frame') {
      parentageData.nodes[0] = { requestId, ...requestData };
    } else {
      parentageData.nodes.push({ requestId, ...requestData });
    }

    const useMainFrameAsBackupParent = () => {
      // Make the main_frame this request's parent if it's an orphan
      parentageData.links.push({
        source: requestId,
        target: parentageData.nodes[0].requestId,
        type: 'RefererUrl',
      });
    };

    let refererOrigin = '';
    if (requestData.refererUrl) {
      const { protocol, host } = processUrl(requestData.refererUrl);
      refererOrigin = `${protocol}://${host}`;
    }

    if (requestData.initiator) { // Use Initiator/Referer to calculate parentage
      const { initiator, refererUrl, parentFrameId } = requestData;
      const parentFrameTargetId = this._frameIdToRequestId[tabId].get(parentFrameId);
      const refererTargetId = this._urlToRequestId[tabId].get(refererUrl);
      const initiatorTargetId = this._originToRequestId[tabId].get(initiator);

      if (requestData.refererUrl && refererOrigin !== initiator && refererTargetId) {
        // log(`RequestId ${requestId} Parent ${targetId} found using RefererUrl`);
        parentageData.links.push({ // Use Referer Header to calculate parentage
          source: requestId,
          target: refererTargetId,
          type: 'RefererUrl',
        });
      } else if (this._requestDetails[tabId][initiatorTargetId]
        && parentFrameId === this._requestDetails[tabId][initiatorTargetId].frameId) {
        parentageData.links.push({ // Use Referer Header to calculate parentage
          source: requestId,
          target: parentFrameTargetId,
          type: 'ParentFrame',
        });
      } else if (initiatorTargetId) { // Use Initiator to calculate parentage
        // log(`RequestId ${requestId} Parent ${targetId} found using Initiator`);
        parentageData.links.push({
          source: requestId,
          target: initiatorTargetId,
          type: 'Initiator',
        });
      } else { useMainFrameAsBackupParent(); }
    } else if (requestData.refererUrl) { // Use Referer Header to calculate parentage
      const { refererUrl } = requestData;
      const targetId = this._urlToRequestId[tabId].get(refererUrl);
      if (targetId) {
        // log(`RequestId ${requestId} Parent ${targetId} found using RefererUrl`);
        parentageData.links.push({
          source: requestId,
          target: targetId,
          type: 'RefererUrl',
        });
      } else { useMainFrameAsBackupParent(); }
    } else if (requestData.parentFrameId !== -1) { // Use ParentFrameId to calculate parentage
      const { parentFrameId } = requestData;
      const targetId = this._frameIdToRequestId[tabId].get(parentFrameId);
      if (targetId) {
        // log(`RequestId ${requestId} Parent ${targetId} found using ParentFrameId`);
        parentageData.links.push({
          source: requestId,
          target: targetId,
          type: 'ParentFrameId',
        });
      } else { useMainFrameAsBackupParent(); }
    } else { useMainFrameAsBackupParent(); }
  }

  getRequests(tabId, requestIds = []) {
    if (!this._requestDetails.hasOwnProperty(tabId)) {
      log(`getRequests Error: TabId ${tabId} not recognized.`);
      return {};
    }

    const data = {};
    for (let i = 0; i < requestIds.length; i++) {
      const requestId = requestIds[i];
      data[requestId] = cloneDeep(this._requestDetails[tabId][requestId]);
    }
    return data;
  }

  getTrackerParentage(tabId) {
    return this._parentageData[tabId] || { nodes: [], links: [] };
  }
}

export default new RequestDetails();
