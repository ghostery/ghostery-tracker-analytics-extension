import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import TrackerDistributionGraph from './TrackerDistributionGraph.jsx';
import {
  updateHighlightedTracker, updateHoveredTracker, expandOrCollapseComponent,
} from '../../store/actions/UserInterfaceActions';
import {
  sendMetrics,
} from '../../store/messages/messageCreators';

const mapStateToProps = state => ({
  trackerInformation: state.PageInfoReducer.trackerInformation,
  trackerListItemRefs: state.UserInterfaceReducer.trackerList.trackerListItemRefs,
  highlightedTracker: state.UserInterfaceReducer.trackerList.highlightedTracker,
  hoveredTracker: state.UserInterfaceReducer.trackerList.hoveredTracker,
  messageCreators: { sendMetrics },
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    updateHighlightedTracker, updateHoveredTracker, expandOrCollapseComponent,
  }, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(TrackerDistributionGraph);
