import {
  OPEN_TOAST,
  CLOSE_TOAST,
  ADD_EXPANDED_TRACKER,
  REMOVE_EXPANDED_TRACKER,
  UPDATE_HIGHLIGHTED_TRACKER,
  UPDATE_HOVERED_TRACKER,
  TOGGLE_FILTER,
  ADD_TRACKER_LIST_ITEM_REF,
  CLEAR_TRACKER_LIST_ITEM_REF,
  UPDATE_TOOLTIP_REF,
  EXPAND_OR_COLLAPSE_COMPONENT,
  UPDATE_SEARCH_INPUT,
  UPDATE_SEARCH_RESULTS,
  UPDATE_LOGIN_STATUS,
  UPDATE_REGISTER_STATUS,
  UPDATE_RESET_PASSWORD_STATUS,
  UPDATE_EMAIL_VERIFICATION_SENT,
  SET_SORT_ORDER,
} from '../actions/UserInterfaceActions';

import { CLEAR_STATE } from '../actions/PageInfoActions';

const initialState = {
  toast: {
    toastText: '',
    show: false,
    initialLoad: true,
    liveShown: false,
    freezeShown: false,
    altStyling: false,
    errorStyling: false,
    panel: false,
  },
  trackerList: {
    expandedTrackers: {},
    highlightedTracker: '',
    hoveredTracker: '',
    trackerListItemRefs: {},
    searchInput: '',
    sortOrder: 'Slowest to Fastest',
    filterOn: false,
    filters: {},
  },
  expandedComponents: {
    trackerList: false,
    trackerDistribution: false,
    pageLatency: false,
  },
  tooltipRef: null,
  bugDbSearchResults: [],
  loginFailed: false,
  registerFailed: false,
  resetPasswordFailed: false,
  resetPasswordSent: false,
  emailVerificationSent: false,
};

function UserInterfaceReducer(state = initialState, action) {
  switch (action.type) {
    case OPEN_TOAST: {
      const {
        toastText,
        liveShown,
        freezeShown,
        altStyling,
        errorStyling,
        panel,
      } = action.data;
      if (liveShown && state.toast.liveShown) { return state; }
      if (freezeShown && state.toast.freezeShown) { return state; }
      const liveShownSwitch = liveShown || state.toast.liveShown;
      const freezeShownSwitch = freezeShown || state.toast.freezeShown;
      return {
        ...state,
        toast: {
          ...state.toast,
          toastText,
          show: true,
          initialLoad: false,
          liveShown: liveShownSwitch,
          freezeShown: freezeShownSwitch,
          altStyling,
          errorStyling,
          panel,
        },
      };
    }
    case CLOSE_TOAST: {
      return { ...state, toast: { ...state.toast, show: false } };
    }
    case ADD_EXPANDED_TRACKER: {
      return {
        ...state,
        trackerList: {
          ...state.trackerList,
          expandedTrackers: {
            ...state.trackerList.expandedTrackers,
            [action.data]: true,
          },
        },
      };
    }
    case REMOVE_EXPANDED_TRACKER: {
      const trackerID = action.data;
      const { [trackerID]: value, ...stateWithoutTrackerID } = state.trackerList.expandedTrackers;
      return {
        ...state,
        trackerList: {
          ...state.trackerList,
          expandedTrackers: stateWithoutTrackerID,
        },
      };
    }
    case UPDATE_HIGHLIGHTED_TRACKER: {
      return { ...state, trackerList: { ...state.trackerList, highlightedTracker: action.data } };
    }
    case UPDATE_HOVERED_TRACKER: {
      return { ...state, trackerList: { ...state.trackerList, hoveredTracker: action.data } };
    }
    case TOGGLE_FILTER: {
      const filters = { ...state.trackerList.filters };
      let { filterOn } = state.trackerList;
      const { selected, category } = action.data;

      if (selected) {
        filters[category] = true;
        if (!filterOn) { filterOn = true; }
      } else {
        delete filters[category];
        if (Object.keys(filters).length === 0) { filterOn = false; }
      }

      return { ...state, trackerList: { ...state.trackerList, filterOn, filters } };
    }
    case ADD_TRACKER_LIST_ITEM_REF: {
      return {
        ...state,
        trackerList: {
          ...state.trackerList,
          trackerListItemRefs: {
            ...state.trackerList.trackerListItemRefs,
            [action.data.id]: action.data.ref,
          },
        },
      };
    }
    case CLEAR_TRACKER_LIST_ITEM_REF: {
      return { ...state, trackerList: { ...state.trackerList, trackerListItemRefs: {} } };
    }
    case CLEAR_STATE: {
      return {
        ...state,
        toast: initialState.toast,
        expandedTrackers: initialState.expandedTrackers,
        highlightedTracker: initialState.highlightedTracker,
        hoveredTracker: initialState.hoveredTracker,
      };
    }
    case UPDATE_TOOLTIP_REF: {
      return { ...state, tooltipRef: action.data };
    }
    case EXPAND_OR_COLLAPSE_COMPONENT: {
      return {
        ...state,
        expandedComponents: { ...state.expandedComponents, ...action.data },
      };
    }
    case SET_SORT_ORDER: {
      return {
        ...state,
        trackerList: {
          ...state.trackerList,
          sortOrder: action.data,
        },
      };
    }
    case UPDATE_SEARCH_INPUT: {
      return {
        ...state,
        trackerList: {
          ...state.trackerList,
          searchInput: action.data,
        },
      };
    }
    case UPDATE_SEARCH_RESULTS: {
      return { ...state, bugDbSearchResults: action.data };
    }
    case UPDATE_LOGIN_STATUS: {
      return { ...state, ...action.data };
    }
    case UPDATE_REGISTER_STATUS: {
      return { ...state, ...action.data };
    }
    case UPDATE_RESET_PASSWORD_STATUS: {
      return { ...state, ...action.data };
    }
    case UPDATE_EMAIL_VERIFICATION_SENT: {
      return { ...state, emailVerificationSent: true };
    }
    default: return state;
  }
}

export default UserInterfaceReducer;
