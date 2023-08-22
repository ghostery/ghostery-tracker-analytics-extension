export const INITIAL_TAB_INFO = 'INITIAL_TAB_INFO';
export const UPDATE_PARENT_TAB_URL = 'UPDATE_PARENT_TAB_URL';
export const UPDATE_IS_PAGE_NOT_SCANNED = 'UPDATE_IS_PAGE_NOT_SCANNED';
export const UPDATE_PARENT_TAB_CLOSED = 'UPDATE_PARENT_TAB_CLOSED';
export const UPDATE_PAGE_SIZE = 'UPDATE_PAGE_SIZE';
export const UPDATE_TRACKER_INFO = 'UPDATE_TRACKER_INFO';
export const UPDATE_TIMING_PERFORMANCE = 'UPDATE_TIMING_PERFORMANCE';
export const UPDATE_IS_LIVE = 'UPDATE_IS_LIVE';
export const CLEAR_STATE = 'CLEAR_STATE';
export const UPDATE_WTM_DATA = 'UPDATE_WTM_DATA';
export const UPDATE_TRACKER_PARENTAGE = 'UPDATE_TRACKER_PARENTAGE';
export const CLEAR_TRACKER_PARENTAGE = 'CLEAR_TRACKER_PARENTAGE';

export const setInitialTabInfo = data => ({ type: INITIAL_TAB_INFO, data });

export const updateParentTabUrl = data => ({ type: UPDATE_PARENT_TAB_URL, data });
export const updateIsPageNotScanned = data => ({ type: UPDATE_IS_PAGE_NOT_SCANNED, data });
export const updateParentTabClosed = () => ({ type: UPDATE_PARENT_TAB_CLOSED });
export const updateTrackerInfo = data => ({ type: UPDATE_TRACKER_INFO, data });
export const updateTimingPerformance = data => ({ type: UPDATE_TIMING_PERFORMANCE, data });
export const updatePageSize = data => ({ type: UPDATE_PAGE_SIZE, data });
export const updateIsLive = data => ({ type: UPDATE_IS_LIVE, data });

export const clearState = () => ({ type: CLEAR_STATE });

export const fetchWTMData = data => (
  (dispatch) => {
    Promise.all(data.map((id) => {
      const url = `https://whotracks.me/data/trackers/ghostery/${id}.json`;
      return fetch(url)
        .then(res => res.json())
        .catch(() => ({ [id]: false }));
    })).then((values) => {
      let wtmData = {};
      values.forEach((value) => {
        if (value.hasOwnProperty('ghostery_id')) {
          wtmData[value.ghostery_id] = value;
        } else {
          wtmData = { ...wtmData, ...value };
        }
      });
      dispatch({ type: UPDATE_WTM_DATA, data: wtmData });
    });
  }
);

export const updateTrackerParentage = data => ({ type: UPDATE_TRACKER_PARENTAGE, data });
export const clearTrackerParentage = () => ({ type: CLEAR_TRACKER_PARENTAGE });
