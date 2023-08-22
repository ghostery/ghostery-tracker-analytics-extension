import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import LiveFreezeToggle from './LiveFreezeToggle.jsx';
import { setIsLive, sendMetrics } from '../../store/messages/messageCreators';
import { openToast, closeToast } from '../../store/actions/UserInterfaceActions';

const mapStateToProps = state => ({
  isLive: state.PageInfoReducer.isLive,
  toast: state.UserInterfaceReducer.toast,
  showToasts: state.SettingsReducer.localSettings.showToasts,
  messageCreators: { setIsLive, sendMetrics },
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({ openToast, closeToast }, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(LiveFreezeToggle);
