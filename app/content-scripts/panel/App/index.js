import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import App from './App.jsx';
import {
  setInitialTabInfo,
  updatePageSize,
  updateTrackerInfo,
  updateTimingPerformance,
  updateIsLive,
} from '../../../store/actions/PageInfoActions';
import {
  updateTooltipRef,
  openToast,
  closeToast,
  updateSearchResults,
  updateLoginStatus,
  updateEmailVerificationSent,
  updateRegisterStatus,
  updateResetPasswordStatus,
} from '../../../store/actions/UserInterfaceActions';
import {
  updateUserInfo,
  updateLocalSettings,
} from '../../../store/actions/SettingsActions';
import { sendMetrics } from '../../../store/messages/messageCreators';

const mapStateToProps = () => ({
  messageCreators: { sendMetrics },
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    setInitialTabInfo,
    updatePageSize,
    updateTrackerInfo,
    updateTimingPerformance,
    updateIsLive,
    updateTooltipRef,
    openToast,
    closeToast,
    updateSearchResults,
    updateUserInfo,
    updateLocalSettings,
    updateLoginStatus,
    updateEmailVerificationSent,
    updateRegisterStatus,
    updateResetPasswordStatus,
  }, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
