import pullDataWithTimestamp from '../../../src/utils/timestampDataParse';
import {
  INITIAL_TAB_INFO,
  UPDATE_PAGE_SIZE,
  UPDATE_TRACKER_INFO,
  UPDATE_TIMING_PERFORMANCE,
  UPDATE_WTM_DATA,
  CLEAR_STATE,
  UPDATE_PARENT_TAB_URL,
  UPDATE_IS_PAGE_NOT_SCANNED,
  UPDATE_PARENT_TAB_CLOSED,
  UPDATE_IS_LIVE,
  UPDATE_TRACKER_PARENTAGE,
  CLEAR_TRACKER_PARENTAGE,
} from '../actions/PageInfoActions';

const initialState = {
  isLive: true,
  parentTabUrl: 'Parent tab URL not loaded',
  isPageNotScanned: true,
  parentTabClosed: false,
  // TODO: Pull Page Load Time from the backend (TabDetails.getPageLoad) as the source of truth
  // Right now, we calculate both on the backend and the frontend
  firstTrackerTimeStamp: 0,
  latestTrackerTimeStamp: 0,
  trackerCount: 0,
  trackerInformation: {},
  requestsBySize: {
    _total: { count: 0 },
  },
  timingPerformance: {
    navigationStart: 0,
  },
  wtmData: {},
  trackerParentage: { nodes: [], links: [] },
};

function PageInfoReducer(state = initialState, action) {
  switch (action.type) {
    case INITIAL_TAB_INFO: {
      const {
        tabIsLive,
        firstTrackerTimeStamp,
        latestTrackerTimeStamp,
        timestampsParsedUrl,
        requestsByTracker,
        trackerCount,
        requestsByType,
        timingPerformance,
        isPageNotScanned,
      } = action.data;

      const parentTabUrl = pullDataWithTimestamp(timestampsParsedUrl).hostWithPath || 'Parent tab URL not loaded';

      return {
        ...state,
        isLive: tabIsLive,
        parentTabUrl,
        isPageNotScanned,
        firstTrackerTimeStamp,
        latestTrackerTimeStamp,
        trackerCount,
        trackerInformation: requestsByTracker,
        requestsBySize: requestsByType,
        timingPerformance,
      };
    }
    case UPDATE_PAGE_SIZE: {
      return { ...state, requestsBySize: { ...state.requestsBySize, ...action.data } };
    }
    case UPDATE_TRACKER_INFO: {
      const {
        firstTrackerTimeStamp,
        latestTrackerTimeStamp,
        trackerCount,
        updatedTrackers,
      } = action.data;

      return {
        ...state,
        firstTrackerTimeStamp,
        latestTrackerTimeStamp,
        trackerCount,
        trackerInformation: { ...state.trackerInformation, ...updatedTrackers },
      };
    }
    case UPDATE_TIMING_PERFORMANCE: {
      return {
        ...state,
        timingPerformance: { ...state.timingPerformance, ...action.data },
      };
    }
    case UPDATE_WTM_DATA: {
      return { ...state, wtmData: { ...state.wtmData, ...action.data } };
    }
    case UPDATE_TRACKER_PARENTAGE: {
      return { ...state, trackerParentage: action.data };
    }
    case CLEAR_TRACKER_PARENTAGE: {
      return { ...state, trackerParentage: { nodes: [], links: [] } };
    }
    case CLEAR_STATE: {
      return { ...initialState, trackerParentage: state.trackerParentage };
    }
    case UPDATE_PARENT_TAB_URL: {
      return {
        ...state,
        parentTabUrl: action.data,
        isPageNotScanned: false,
      };
    }
    case UPDATE_IS_PAGE_NOT_SCANNED: {
      return {
        ...state,
        isPageNotScanned: true,
        trackerInformation: {},
        timingPerformance: initialState.timingPerformance,
        requestsBySize: initialState.requestsBySize,
      };
    }
    case UPDATE_PARENT_TAB_CLOSED: {
      return { ...state, parentTabClosed: true };
    }
    case UPDATE_IS_LIVE: {
      return { ...state, isLive: action.data };
    }
    default: return state;
  }
}

export default PageInfoReducer;
