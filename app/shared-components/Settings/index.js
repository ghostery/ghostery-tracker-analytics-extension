import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Settings from './Settings.jsx';
import {
  resetBlueBar,
  login,
  logout,
  openAccountPage,
  sendMetrics,
  openProductTour,
  openGlossary,
  openLicenses,
  toggleBlueBar,
  toggleToasts,
} from '../../store/messages/messageCreators';
import { closeToast } from '../../store/actions/UserInterfaceActions';

const mapStateToProps = state => ({
  userInfo: state.SettingsReducer.userInfo,
  showBlueBar: state.SettingsReducer.localSettings.showBlueBar,
  showToasts: state.SettingsReducer.localSettings.showToasts,
  messageCreators: {
    resetBlueBar,
    login,
    logout,
    openAccountPage,
    sendMetrics,
    openProductTour,
    openGlossary,
    openLicenses,
    toggleBlueBar,
    toggleToasts,
  },
  isPageNotScanned: state.PageInfoReducer.isPageNotScanned,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({ closeToast }, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
