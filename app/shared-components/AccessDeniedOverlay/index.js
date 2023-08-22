import { connect } from 'react-redux';
import {
  login,
  logout,
  subscribe,
  sendMetrics,
  sendEmailVerification,
} from '../../store/messages/messageCreators';
import AccessDeniedOverlay from './AccessDeniedOverlay.jsx';

const mapStateToProps = state => ({
  userInfo: state.SettingsReducer.userInfo,
  emailVerificationSent: state.UserInterfaceReducer.emailVerificationSent,
  messageCreators: { login, logout, subscribe, sendMetrics, sendEmailVerification },
  isPageNotScanned: state.PageInfoReducer.isPageNotScanned,
});

export default connect(mapStateToProps)(AccessDeniedOverlay);
