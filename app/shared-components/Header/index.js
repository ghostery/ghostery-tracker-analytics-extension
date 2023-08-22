import { connect } from 'react-redux';

import Header from './Header.jsx';
import { sendMetrics, downloadDataFiles, subscribe } from '../../store/messages/messageCreators';

const mapStateToProps = state => ({
  tooltipRef: state.UserInterfaceReducer.tooltipRef,
  userInfo: state.SettingsReducer.userInfo,
  parentTabClosed: state.PageInfoReducer.parentTabClosed,
  messageCreators: { sendMetrics, downloadDataFiles, subscribe },
  isPageNotScanned: state.PageInfoReducer.isPageNotScanned,
});

export default connect(mapStateToProps)(Header);
