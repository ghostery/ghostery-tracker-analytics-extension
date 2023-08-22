import React from 'react';
import PropTypes from 'prop-types';
import ClassNames from 'classnames';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

import './ThemedToggle.scss';

const ThemedToggle = ({
  children,
  activeButton,
  handleClick,
  icons,
  tooltipPosition,
  tooltipStrings,
  tooltipRef,
}) => (
  <div className="ThemedToggle d-flex">
    {children.map((child, i) => {
      const button = ClassNames(
        'ThemedToggle__button',
        {
          clicked: i === activeButton,
          icons,
          'd-flex': icons,
          'align-items-center': icons,
          'justify-content-center': icons,
        },
      );
      if (!tooltipStrings || !tooltipRef) {
        return (
          <div
            className={button}
            onClick={() => handleClick(i)}
            key={`tooltip-sans-${child.key ? child.key : child.props.children}`}
          >
            {children[i]}
          </div>
        );
      }
      return (
        <OverlayTrigger
          key={`overlay-${tooltipStrings[i]}`}
          placement={tooltipPosition}
          container={tooltipRef}
          overlay={(<Tooltip className="tooltipLeft">{tooltipStrings[i]}</Tooltip>)}
          delay={{ show: 500 }}
        >
          <div className={button} onClick={() => handleClick(i)}>
            {children[i]}
          </div>
        </OverlayTrigger>
      );
    })}
  </div>
);

ThemedToggle.propTypes = {
  children: PropTypes.arrayOf(PropTypes.element).isRequired,
  activeButton: PropTypes.number.isRequired,
  handleClick: PropTypes.func.isRequired,
  icons: PropTypes.bool,
  tooltipPosition: PropTypes.oneOf(['top', 'bottom', 'left', 'right']),
  tooltipStrings: PropTypes.arrayOf(PropTypes.string),
  tooltipRef: PropTypes.instanceOf(PropTypes.element),
};

ThemedToggle.defaultProps = {
  icons: false,
  tooltipPosition: null,
  tooltipStrings: null,
  tooltipRef: null,
};

export default ThemedToggle;
