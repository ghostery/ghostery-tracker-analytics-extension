import {
  UPDATE_USER_INFO,
  UPDATE_LOCAL_SETTINGS,
} from '../actions/SettingsActions';

const initialState = {
  userInfo: {
    email: '',
    signedIn: true,
    insightsUser: true,
    freeTrial: false,
    emailVerified: false,
    freeTrialTriggered: false,
    freeTrialDaysRemaining: 0,
  },
  localSettings: {
    starredTrackerIds: {},
    pageEvents: {},
    showBlueBar: false,
    showToasts: false,
    tabIconExplainerAcknowledged: false,
    timelineScale: 'linear',
  },
};

function SettingsReducer(state = initialState, action) {
  switch (action.type) {
    case UPDATE_USER_INFO: {
      return { ...state, userInfo: action.data };
    }
    case UPDATE_LOCAL_SETTINGS: {
      return { ...state, localSettings: { ...state.localSettings, ...action.data } };
    }
    default: return state;
  }
}

export default SettingsReducer;
