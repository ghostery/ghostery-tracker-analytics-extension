import { connect } from 'react-redux';

import PageSizeGraph from './PageSizeGraph.jsx';

const mapStateToProps = state => ({
  requestsBySize: state.PageInfoReducer.requestsBySize,
});

export default connect(mapStateToProps)(PageSizeGraph);
