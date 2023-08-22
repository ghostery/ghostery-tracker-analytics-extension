import React, { Component } from 'react';
import PropTypes from 'prop-types';

import './Header.scss';

// NOTE: This toggle component must be an extension of React.Component rather than
// a functional component because the Boostrap <Dropdown /> component requires that
// custom toggle and menu components be able to accept refs

// NOTE: I imagine we will end making a custom component for the settings dropdown
// menu as well, which works in the same way as the toggle (ie. as={CustomMenu})

class CustomMoreToggle extends Component {
  handleClick = (e) => {
    e.preventDefault();

    const { onClick } = this.props;
    onClick(e);
  }

  render() {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="Header__dropdownToggle d-inline-block align-top"
        width="10"
        height="20"
        viewBox="0 0 4 16"
        onClick={this.handleClick}
      >
        <path d="M0 0h4v4H0zm0 6h4v4H0zm0 6h4v4H0z" fill="#FFF" fillRule="evenodd" />
      </svg>
    );
  }
}

CustomMoreToggle.propTypes = {
  onClick: PropTypes.func.isRequired,
};

export default CustomMoreToggle;
