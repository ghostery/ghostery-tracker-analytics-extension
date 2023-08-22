import { connect } from 'react-redux';

import TrackerTimelineGraph from './TrackerTimelineGraph.jsx';

const mapStateToProps = state => ({
  firstTrackerTimeStamp: state.PageInfoReducer.firstTrackerTimeStamp,
  latestTrackerTimeStamp: state.PageInfoReducer.latestTrackerTimeStamp,
  timingPerformance: state.PageInfoReducer.timingPerformance,
  pageEvents: state.SettingsReducer.localSettings.pageEvents,
  scale: state.SettingsReducer.localSettings.timelineScale,
  trackerListExpanded: state.UserInterfaceReducer.expandedComponents.trackerList,
});


export default connect(mapStateToProps)(TrackerTimelineGraph);
