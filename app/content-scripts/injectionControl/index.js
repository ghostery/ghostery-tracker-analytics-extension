/*!
 * Blue Bar UI
 *
 * Insights by Ghostery
 * https://www.ghostery.com/insights/
 *
 * Copyright 2019 Ghostery, Inc. All rights reserved.
 * See https://www.ghostery.com/eula for license agreement.
 */
import injectBlueBar from './injectBlueBar';
import injectLoadingPanel from './injectLoadingPanel';
import injectEndOfFreeTrialPopup from './injectEndOfFreeTrialPopup';
import { loadFonts } from '../shared/utils';
import { convertMilliseconds } from '../../../src/utils/convert';

const injectionControlState = {
  insightsUser: false,
  freeTrial: false,
  show: false,
  blueBarInjected: false,
  endOfFreeTrialPopupInjected: false,
  panelInjected: false,
};

const blueBarDisplayState = {
  statText: [
    'Trackers: 0',
    'Tracker Requests: 0',
    'Page Loading...',
  ],
  top: '25px',
  left: `${window.innerWidth - 475}px`,
};

const statTextMap = {
  trackers: 0,
  requests: 1,
  pageLoad: 2,
};

/* ADD OPEN SANS FONT TO THE DOCUMENT IF FontFaceSet INTERFACE EXISTS */
/* ------------------------------------------------------------------------------------- */
if (document.fonts) { loadFonts(); }

/* BLUE BAR AND LOADING PANEL INJECTOR */
/* ------------------------------------------------------------------------------------- */
const fontReadyInjector = (injectFunc) => {
  if (document.fonts) {
    document.fonts.ready.then(() => injectFunc());
  } else {
    injectFunc();
  }
};

const blueBarInjector = () => {
  const { insightsUser, freeTrial, show, blueBarInjected, panelInjected } = injectionControlState;
  if (!(insightsUser || freeTrial) || !show || blueBarInjected || panelInjected) { return; }

  fontReadyInjector(() => injectBlueBar(blueBarDisplayState, injectionControlState));
};

const endOfFreeTrialPopupInjector = () => {
  const { endOfFreeTrialPopupInjected } = injectionControlState;
  if (endOfFreeTrialPopupInjected) return;

  fontReadyInjector(() => injectEndOfFreeTrialPopup(injectionControlState));
};

const loadingPanelInjector = () => fontReadyInjector(injectLoadingPanel);

/* BACKGROUND MESSAGING & DATA PARSING */
/* ------------------------------------------------------------------------------------- */
const updatePageLoad = (data) => {
  const { redirectStart, fetchStart, loadEventEnd } = data;
  const start = redirectStart > 0 ? redirectStart : fetchStart;
  const duration = loadEventEnd - start;
  const realDuration = duration === Math.abs(duration);

  if (realDuration) {
    blueBarDisplayState.statText[statTextMap.pageLoad] = `Page Load: ${convertMilliseconds(duration)}`;
  }
};

const injectionControlListener = (message) => {
  const { data } = message;
  switch (message.type) {
    case 'RequestsByTrackerDelta': {
      blueBarDisplayState.statText[statTextMap.trackers] = `Trackers: ${data.trackerCount}`;
      return;
    }
    case 'RequestsByTypeDelta': {
      if (data._tracker) {
        blueBarDisplayState.statText[statTextMap.requests] = `Tracker Requests: ${data._tracker.count}`;
      }
      return;
    }
    case 'timingPerformance': {
      updatePageLoad(data);
      return;
    }
    case 'TabDetails': {
      const { trackerCount, timingPerformance, requestsByType } = data;
      blueBarDisplayState.statText[statTextMap.trackers] = `Trackers: ${trackerCount}`;
      blueBarDisplayState.statText[statTextMap.requests] = `Tracker Requests: ${requestsByType._tracker.count}`;
      updatePageLoad(timingPerformance);
      return;
    }
    case 'Settings':
    case 'SettingsUpdated': {
      const { blueBarPosition, showBlueBar, userInfo } = message.data;
      if (blueBarPosition) {
        if (blueBarPosition === 'default') {
          blueBarDisplayState.top = '25px';
          blueBarDisplayState.left = `${window.innerWidth - 475}px`;
        } else {
          const { top, left } = blueBarPosition;
          if (top && left) {
            blueBarDisplayState.top = top;
            blueBarDisplayState.left = left;
          }
        }
      }
      if (typeof showBlueBar === 'boolean') {
        injectionControlState.show = showBlueBar;
        blueBarInjector();
      }
      if (userInfo) {
        const { insightsUser, freeTrial } = userInfo;
        injectionControlState.insightsUser = insightsUser;
        injectionControlState.freeTrial = freeTrial;
        blueBarInjector();
      }
      break;
    }
    case 'UserInfo': {
      const { insightsUser, freeTrial } = message.data;
      injectionControlState.insightsUser = insightsUser;
      injectionControlState.freeTrial = freeTrial;
      blueBarInjector();
      break;
    }
    case 'InjectEndOfFreeTrialPopup': {
      endOfFreeTrialPopupInjector();
      break;
    }
    case 'InjectPanel': {
      injectionControlState.panelInjected = true;
      loadingPanelInjector();
      break;
    }
    case 'RemovePanel': {
      injectionControlState.panelInjected = false;
      blueBarInjector();
      break;
    }
    default:
  }
};

window.port = chrome.runtime.connect({ name: 'window' });
window.port.onMessage.addListener(injectionControlListener);
window.port.postMessage({ type: 'RequestUserInfo' });
window.port.postMessage({ type: 'RequestSettings' });
window.port.postMessage({ type: 'RequestTabDetails' });
window.port.postMessage({ type: 'RequestEndOfFreeTrialPopup' });
