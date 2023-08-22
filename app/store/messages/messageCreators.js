import Globals from '../../../src/classes/Globals';

const { GHOSTERY_DOMAIN } = Globals;

const postMessage = (type, data) => window.port.postMessage({ type, data });

export const sendMetrics = data => postMessage('Metrics', data);

export const toggleScale = data => postMessage('SetPrefs', { timelineScale: data });
export const resetBlueBar = data => postMessage('SetPrefs', { blueBarPosition: data });
export const toggleBlueBar = data => postMessage('SetPrefs', { showBlueBar: data });
export const toggleToasts = data => postMessage('SetPrefs', { showToasts: data });

export const setIsLive = data => postMessage('SetIsLive', data);

export const addStarredTracker = (data) => {
  postMessage('UpdateTrackerStar', {
    trackerId: data.trackerId,
    trackerName: data.trackerName,
    action: 'addStar',
  });
  sendMetrics({ type: 'favorite_tracker', insightsView: data.view });
};
export const removeStarredTracker = (data) => {
  postMessage('UpdateTrackerStar', {
    trackerId: data.trackerId,
    trackerName: data.trackerName,
    action: 'removeStar',
  });
  sendMetrics({ type: 'unfavorite_tracker', insightsView: data.view });
};

export const addPageEvent = (pageEvent) => {
  postMessage('UpdatePageEvent', { pageEvent, action: 'addPageEvent' });
};
export const removePageEvent = (pageEvent) => {
  postMessage('UpdatePageEvent', { pageEvent, action: 'removePageEvent' });
};

export const searchBugDb = data => postMessage('SearchBugDb', data);

export const login = data => postMessage('Login', data);
export const register = data => postMessage('Register', data);
export const resetPassword = data => postMessage('ResetPassword', data);
export const logout = () => postMessage('Logout');
export const updateUserInfo = () => postMessage('UpdateUserInfo');

export const subscribe = () => postMessage('OpenTab', `https://${GHOSTERY_DOMAIN}.com/become-a-contributor`);
export const openAccountPage = () => postMessage('OpenTab', `https://account.${GHOSTERY_DOMAIN}.com`);

export const sendEmailVerification = () => postMessage('SendEmailVerification');

export const openApp = (innerTab) => {
  if (innerTab) {
    postMessage('OpenApp', innerTab);
  } else { postMessage('OpenApp'); }
};
export const togglePanel = () => postMessage('TogglePanel');
export const openProductTour = () => {
  sendMetrics({ type: 'visit_tutorial' });
  postMessage('OpenProductTour');
};
export const openGlossary = () => {
  sendMetrics({ type: 'visit_glossary' });
  postMessage('OpenGlossary');
};
export const openLicenses = () => postMessage('OpenLicenses');

export const downloadDataFiles = () => postMessage('RequestDataFiles');

export const markTabIconExplainerAcknowledged = () => {
  postMessage('MarkTabIconExplainerAcknowledged');
};

export const requestTrackerParentage = () => postMessage('RequestTrackerParentage');
