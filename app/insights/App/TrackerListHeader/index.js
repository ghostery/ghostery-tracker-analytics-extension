import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import TrackerListHeader from './TrackerListHeader.jsx';
import {
  expandOrCollapseComponent, toggleFilter, updateSearchInput, setSortOrder,
} from '../../../store/actions/UserInterfaceActions';
import {
  toggleScale, sendMetrics, addPageEvent, removePageEvent,
} from '../../../store/messages/messageCreators';

const mapStateToProps = state => ({
  scale: state.SettingsReducer.localSettings.timelineScale,
  pageEvents: state.SettingsReducer.localSettings.pageEvents,
  timingPerformance: state.PageInfoReducer.timingPerformance,
  searchInput: state.UserInterfaceReducer.trackerList.searchInput,
  sortOrder: state.UserInterfaceReducer.trackerList.sortOrder,
  filters: state.UserInterfaceReducer.trackerList.filters,
  trackerInformation: state.PageInfoReducer.trackerInformation,
  messageCreators: { sendMetrics, toggleScale, addPageEvent, removePageEvent },
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    expandOrCollapseComponent,
    toggleFilter,
    setSortOrder,
    updateSearchInput,
  }, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(TrackerListHeader);
