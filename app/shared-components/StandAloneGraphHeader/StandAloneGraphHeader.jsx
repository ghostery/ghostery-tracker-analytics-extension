import React from 'react';
import PropTypes from 'prop-types';
import ClassNames from 'classnames';
import Nav from 'react-bootstrap/Nav';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

import './StandAloneGraphHeader.scss';

const StandAloneGraphHeader = ({
  title,
  children,
  small,
  handleClick,
  tooltipText,
  hideSeeDetails,
  tooltipRef,
  expandable,
  expanded,
  expandGraph,
}) => {
  const standAloneGraphHeaderClasses = ClassNames('StandAloneGraphHeader__mainInfo', {
    'd-flex': small,
    'align-items-center': small,
    'justify-content-between': small,
    small,
  });
  const standAloneGraphHeaderArrows = ClassNames(
    'StandAloneGraphHeader__arrows',
    'd-flex',
    'align-items-center',
    'justify-items-center',
    { StandAloneGraphHeader__collapse: expanded },
  );

  return (
    <div className="d-flex">
      <div className={standAloneGraphHeaderClasses}>
        <div className="StandAloneGraphHeader__header d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <h3>{title}</h3>
            <OverlayTrigger
              container={tooltipRef}
              placement="auto"
              overlay={(
                <Tooltip className="tooltipLeft">
                  {tooltipText}
                </Tooltip>
              )}
            >
              <img
                src={[chrome.extension.getURL('dist/images/shared/info-icon.svg')]}
                className="infoIcon"
                width="16"
                height="16"
                alt={`More info hover: ${tooltipText}`}
              />
            </OverlayTrigger>
          </div>
          {!small && expandable && (
            <OverlayTrigger
              container={tooltipRef}
              placement="auto"
              delay={500}
              overlay={(
                <Tooltip className="tooltipLeft">
                  {expanded ? 'Collapse' : 'Expand'}
                </Tooltip>
              )}
            >
              <div className={standAloneGraphHeaderArrows} onClick={expandGraph}>
                {expanded ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="23" height="9">
                    <path fill="#EBEBEB" d="M9.784 4.982a.626.626 0 0 0-.003-.88L6.004.276c-.452-.463-1.129.231-.677.694L8.17 3.886c.094.097.065.175-.079.175H.85a.485.485 0 0 0-.479.491c0 .272.214.492.48.492H8.09c.138 0 .175.076.079.175L5.327 8.135c-.452.463.225 1.158.677.695l3.78-3.848zm3.071-.86a.626.626 0 0 0 .004.88l3.777 3.828c.451.463 1.129-.231.677-.695L14.47 5.22c-.095-.097-.065-.175.078-.175h7.242c.265 0 .48-.22.48-.492a.485.485 0 0 0-.48-.49h-7.242c-.137 0-.175-.077-.078-.176L17.313.969c.452-.463-.226-1.157-.677-.694l-3.78 3.848z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="17" height="8">
                    <path fill="#EBEBEB" d="M15.424 3.556c.114 0 .144-.07.065-.158L13.092.765c-.38-.418.19-1.045.571-.627l3.183 3.456a.594.594 0 0 1 .004.794l-3.187 3.474c-.38.418-.951-.21-.57-.627l2.396-2.633c.08-.09.05-.158-.065-.158H1.577c-.114 0-.145.07-.066.158l2.397 2.633c.38.418-.19 1.045-.571.627L.154 4.406a.594.594 0 0 1-.004-.794L3.337.138c.38-.418.951.21.57.627L1.512 3.398c-.08.09-.05.158.066.158h13.847z" />
                  </svg>
                )}
              </div>
            </OverlayTrigger>
          )}
        </div>
        {children}
      </div>
      {small && !hideSeeDetails && (
        <Nav.Link
          className="StandAloneGraphHeader__seeDetailsLink"
          onClick={handleClick}
        >
          See details
        </Nav.Link>
      )}
    </div>
  );
};

StandAloneGraphHeader.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  small: PropTypes.bool,
  handleClick: PropTypes.func,
  hideSeeDetails: PropTypes.bool,
  tooltipRef: PropTypes.instanceOf(PropTypes.element),
  tooltipText: PropTypes.string.isRequired,
  expandable: PropTypes.bool,
  expanded: PropTypes.bool,
  expandGraph: PropTypes.func,
};

StandAloneGraphHeader.defaultProps = {
  children: null,
  small: false,
  handleClick: null,
  hideSeeDetails: false,
  tooltipRef: null,
  expandable: false,
  expanded: false,
  expandGraph: null,
};

export default StandAloneGraphHeader;
