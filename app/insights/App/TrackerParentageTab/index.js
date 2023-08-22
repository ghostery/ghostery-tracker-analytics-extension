import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import TrackerParentageTab from './TrackerParentageTab.jsx';
import { clearTrackerParentage } from '../../../store/actions/PageInfoActions';
import { requestTrackerParentage, sendMetrics } from '../../../store/messages/messageCreators';

const mapStateToProps = state => ({
  trackerParentage: state.PageInfoReducer.trackerParentage,
  requestsCount: state.PageInfoReducer.requestsBySize._total.count,
  isLive: state.PageInfoReducer.isLive,
  tooltipRef: state.UserInterfaceReducer.tooltipRef,
  messageCreators: { requestTrackerParentage, sendMetrics },
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({ clearTrackerParentage }, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(TrackerParentageTab);
