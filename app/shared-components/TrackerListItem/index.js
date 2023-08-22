import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import TrackerListItem from './TrackerListItem.jsx';
import { addTrackerListItemRef, openToast } from '../../store/actions/UserInterfaceActions';

const mapStateToProps = state => ({
  tooltipRef: state.UserInterfaceReducer.tooltipRef,
  showToasts: state.SettingsReducer.localSettings.showToasts,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({ addTrackerListItemRef, openToast }, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(TrackerListItem);
