import React from 'react';
import PropTypes from 'prop-types';
import ClassNames from 'classnames';

import './ThemedLegend.scss';

const ThemedLegend = ({ pageEvent }) => {
  const keyIconClasses = type => ClassNames(
    'ThemedLegend__keyIcon', type, { 'ThemedLegend--marginTop': pageEvent },
  );
  const legendInfo = [
    { class: 'green', text: '0-99 ms' },
    { class: 'yellow', text: '100-499 ms' },
    { class: 'red', text: '500+ ms' },
    { class: 'pageEvent', text: 'Page event' },
  ];
  return (
    <div className="ThemedLegend d-flex">
      {legendInfo.map((legendItem) => {
        if (legendItem.class === 'pageEvent' && !pageEvent) { return null; }
        return (
          <div
            key={legendItem.class}
            className="ThemedLegend__keyContainer d-flex align-items-center"
          >
            <div className={keyIconClasses(legendItem.class)} />
            <span className="ThemedLegend__keyText">
              {legendItem.text}
            </span>
          </div>
        );
      })}
    </div>
  );
};

ThemedLegend.propTypes = {
  pageEvent: PropTypes.bool,
};

ThemedLegend.defaultProps = {
  pageEvent: false,
};

export default ThemedLegend;
