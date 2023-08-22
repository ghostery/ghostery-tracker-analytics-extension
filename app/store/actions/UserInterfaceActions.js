export const OPEN_TOAST = 'OPEN_TOAST';
export const CLOSE_TOAST = 'CLOSE_TOAST';
export const ADD_EXPANDED_TRACKER = 'ADD_EXPANDED_TRACKER';
export const REMOVE_EXPANDED_TRACKER = 'REMOVE_EXPANDED_TRACKER';
export const UPDATE_HIGHLIGHTED_TRACKER = 'UPDATE_HIGHLIGHTED_TRACKER';
export const UPDATE_HOVERED_TRACKER = 'UPDATE_HOVERED_TRACKER';
export const TOGGLE_FILTER = 'TOGGLE_FILTER';
export const ADD_TRACKER_LIST_ITEM_REF = 'ADD_TRACKER_LIST_ITEM_REF';
export const CLEAR_TRACKER_LIST_ITEM_REF = 'CLEAR_TRACKER_LIST_ITEM_REF';
export const UPDATE_TOOLTIP_REF = 'UPDATE_TOOLTIP_REF';
export const EXPAND_OR_COLLAPSE_COMPONENT = 'EXPAND_OR_COLLAPSE_COMPONENT';
export const SET_SORT_ORDER = 'SET_SORT_ORDER';
export const UPDATE_SEARCH_INPUT = 'UPDATE_SEARCH_INPUT';
export const UPDATE_SEARCH_RESULTS = 'UPDATE_SEARCH_RESULTS';
export const UPDATE_LOGIN_STATUS = 'UPDATE_LOGIN_STATUS';
export const UPDATE_REGISTER_STATUS = 'UPDATE_REGISTER_STATUS';
export const UPDATE_RESET_PASSWORD_STATUS = 'UPDATE_RESET_PASSWORD_STATUS';
export const UPDATE_EMAIL_VERIFICATION_SENT = 'UPDATE_EMAIL_VERIFICATION_SENT';

let toastTimeout;
const setToastTimeout = (dispatch, duration) => {
  toastTimeout = setTimeout(() => { dispatch({ type: CLOSE_TOAST }); }, duration);
};
export const openToast = (toastData, duration) => (
  (dispatch) => {
    dispatch({ type: OPEN_TOAST, data: toastData });
    if (duration) {
      clearTimeout(toastTimeout);
      setToastTimeout(dispatch, duration);
    }
  }
);
export const closeToast = () => {
  clearTimeout(toastTimeout);
  return dispatch => dispatch({ type: CLOSE_TOAST });
};

export const addExpandedTracker = data => ({ type: ADD_EXPANDED_TRACKER, data });
export const removeExpandedTracker = data => ({ type: REMOVE_EXPANDED_TRACKER, data });

export const updateHighlightedTracker = data => ({ type: UPDATE_HIGHLIGHTED_TRACKER, data });
export const updateHoveredTracker = data => ({ type: UPDATE_HOVERED_TRACKER, data });

export const toggleFilter = data => ({ type: TOGGLE_FILTER, data });

export const addTrackerListItemRef = (id, ref) => ({
  type: ADD_TRACKER_LIST_ITEM_REF,
  data: { id, ref },
});

export const clearTrackerListItemRef = () => ({ type: CLEAR_TRACKER_LIST_ITEM_REF });

export const updateTooltipRef = data => ({ type: UPDATE_TOOLTIP_REF, data });

export const expandOrCollapseComponent = data => ({ type: EXPAND_OR_COLLAPSE_COMPONENT, data });

export const setSortOrder = data => ({ type: SET_SORT_ORDER, data });

export const updateSearchInput = data => ({ type: UPDATE_SEARCH_INPUT, data });

export const updateSearchResults = data => ({ type: UPDATE_SEARCH_RESULTS, data });

export const updateLoginStatus = data => ({ type: UPDATE_LOGIN_STATUS, data });
export const updateRegisterStatus = data => ({ type: UPDATE_REGISTER_STATUS, data });
export const updateResetPasswordStatus = data => ({ type: UPDATE_RESET_PASSWORD_STATUS, data });
export const updateEmailVerificationSent = () => ({ type: UPDATE_EMAIL_VERIFICATION_SENT });
