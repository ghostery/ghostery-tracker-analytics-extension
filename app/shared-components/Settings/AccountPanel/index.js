import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import AccountPanel from './AccountPanel.jsx';
import { login, register, resetPassword, sendMetrics } from '../../../store/messages/messageCreators';
import {
  openToast,
  closeToast,
  updateLoginStatus,
  updateRegisterStatus,
  updateResetPasswordStatus,
} from '../../../store/actions/UserInterfaceActions';

const mapStateToProps = state => ({
  messageCreators: { login, register, resetPassword, sendMetrics },
  loginFailed: state.UserInterfaceReducer.loginFailed,
  registerFailed: state.UserInterfaceReducer.registerFailed,
  resetPasswordFailed: state.UserInterfaceReducer.resetPasswordFailed,
  resetPasswordSent: state.UserInterfaceReducer.resetPasswordSent,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    openToast,
    closeToast,
    updateLoginStatus,
    updateRegisterStatus,
    updateResetPasswordStatus,
  }, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(AccountPanel);
