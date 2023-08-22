import { connect } from 'react-redux';

import StandAloneGraphHeader from './StandAloneGraphHeader.jsx';

const mapStateToProps = state => ({
  tooltipRef: state.UserInterfaceReducer.tooltipRef,
});

export default connect(mapStateToProps)(StandAloneGraphHeader);
