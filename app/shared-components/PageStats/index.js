import { connect } from 'react-redux';

import PageStats from './PageStats.jsx';
import { markTabIconExplainerAcknowledged, openApp, sendMetrics, togglePanel } from '../../store/messages/messageCreators';

const mapStateToProps = state => ({
  requestsBySize: state.PageInfoReducer.requestsBySize,
  trackerCount: state.PageInfoReducer.trackerCount,
  tooltipRef: state.UserInterfaceReducer.tooltipRef,
  tabIconExplainerAcknowledged: state.SettingsReducer.localSettings.tabIconExplainerAcknowledged,
  messageCreators: { markTabIconExplainerAcknowledged, openApp, sendMetrics, togglePanel },
});

export default connect(mapStateToProps)(PageStats);
