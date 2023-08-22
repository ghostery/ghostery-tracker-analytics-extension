import { connect } from 'react-redux';
import PageNotScannedOverlay from './PageNotScannedOverlay.jsx';

const mapStateToProps = state => ({
  isPageNotScanned: state.PageInfoReducer.isPageNotScanned,
  signedIn: state.SettingsReducer.userInfo.signedIn,
});

export default connect(mapStateToProps, null)(PageNotScannedOverlay);
