import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import TrackerList from './TrackerList.jsx';
import {
  addExpandedTracker,
  removeExpandedTracker,
  updateHighlightedTracker,
  updateHoveredTracker,
  clearTrackerListItemRef,
} from '../../store/actions/UserInterfaceActions';
import {
  addStarredTracker,
  removeStarredTracker,
  sendMetrics,
} from '../../store/messages/messageCreators';

const mapStateToProps = state => ({
  trackerInformation: state.PageInfoReducer.trackerInformation,
  starredTrackerIds: state.SettingsReducer.localSettings.starredTrackerIds,
  expandedTrackers: state.UserInterfaceReducer.trackerList.expandedTrackers,
  highlightedTracker: state.UserInterfaceReducer.trackerList.highlightedTracker,
  hoveredTracker: state.UserInterfaceReducer.trackerList.hoveredTracker,
  searchInput: state.UserInterfaceReducer.trackerList.searchInput,
  sortOrder: state.UserInterfaceReducer.trackerList.sortOrder,
  filterOn: state.UserInterfaceReducer.trackerList.filterOn,
  filters: state.UserInterfaceReducer.trackerList.filters,
  messageCreators: { sendMetrics, addStarredTracker, removeStarredTracker },
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    addExpandedTracker,
    removeExpandedTracker,
    updateHighlightedTracker,
    updateHoveredTracker,
    clearTrackerListItemRef,
  }, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(TrackerList);
