import { connect } from 'react-redux';

import OverviewTab from './OverviewTab.jsx';

const mapStateToProps = state => ({
  trackerListExpanded: state.UserInterfaceReducer.expandedComponents.trackerList,
  trackerDistributionExpanded: state.UserInterfaceReducer.expandedComponents.trackerDistribution,
  pageLatencyExpanded: state.UserInterfaceReducer.expandedComponents.pageLatency,
});

export default connect(mapStateToProps)(OverviewTab);
