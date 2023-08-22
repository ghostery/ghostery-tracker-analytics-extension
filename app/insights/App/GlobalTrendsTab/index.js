import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import GlobalTrendsTab from './GlobalTrendsTab.jsx';
import { fetchWTMData } from '../../../store/actions/PageInfoActions';
import {
  addStarredTracker, removeStarredTracker, sendMetrics,
} from '../../../store/messages/messageCreators';

const mapStateToProps = state => ({
  totalSize: (state.PageInfoReducer.requestsBySize.hasOwnProperty('_tracker'))
    ? state.PageInfoReducer.requestsBySize._tracker.size
    : 0,
  trackerInformation: state.PageInfoReducer.trackerInformation,
  wtmData: state.PageInfoReducer.wtmData,
  starredTrackerIds: state.SettingsReducer.localSettings.starredTrackerIds,
  messageCreators: { sendMetrics, addStarredTracker, removeStarredTracker },
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({ fetchWTMData }, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(GlobalTrendsTab);
