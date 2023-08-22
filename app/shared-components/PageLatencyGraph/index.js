import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import PageLatencyGraph from './PageLatencyGraph.jsx';
import { expandOrCollapseComponent } from '../../store/actions/UserInterfaceActions';

const mapStateToProps = state => ({
  timingPerformance: state.PageInfoReducer.timingPerformance,
  expanded: state.UserInterfaceReducer.expandedComponents.pageLatency,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({ expandOrCollapseComponent }, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(PageLatencyGraph);
