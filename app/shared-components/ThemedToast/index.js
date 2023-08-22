import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import ThemedToast from './ThemedToast.jsx';
import { closeToast } from '../../store/actions/UserInterfaceActions';

const mapStateToProps = state => ({
  toastText: state.UserInterfaceReducer.toast.toastText,
  show: state.UserInterfaceReducer.toast.show,
  initialLoad: state.UserInterfaceReducer.toast.initialLoad,
  altStyling: state.UserInterfaceReducer.toast.altStyling,
  errorStyling: state.UserInterfaceReducer.toast.errorStyling,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({ closeToast }, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(ThemedToast);
