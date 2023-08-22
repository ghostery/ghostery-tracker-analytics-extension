import React from 'react';
import PropTypes from 'prop-types';
import ClassNames from 'classnames';

import './ThemedToast.scss';

const ThemedToast = ({
  show, initialLoad, toastText, actions, altStyling, errorStyling, panel,
}) => {
  const toastClasses = ClassNames(
    'ThemedToast',
    'd-flex',
    'justify-content-between',
    'align-items-center',
    {
      show,
      initialLoad,
      'ThemedToast--small': altStyling,
      changePosition: altStyling && panel,
      error: errorStyling,
    },
  );

  const closeButtonClasses = ClassNames(
    'ThemedToast__closeButton',
    { error: altStyling },
  );

  return (
    <div className={toastClasses}>
      <div className="d-flex">
        {toastText === 'You are now in Freeze mode. Data is not populating in real time.'
          && (<p className="ThemedToast--boldText">Heads up!</p>)}
        <p>{toastText}</p>
      </div>
      <img
        alt="Close Toast"
        src={[chrome.extension.getURL('dist/images/shared/x-icon-semi-transparent.svg')]}
        className={closeButtonClasses}
        onClick={actions.closeToast}
      />
    </div>
  );
};

ThemedToast.propTypes = {
  show: PropTypes.bool.isRequired,
  toastText: PropTypes.string.isRequired,
  initialLoad: PropTypes.bool.isRequired,
  actions: PropTypes.shape({
    closeToast: PropTypes.func.isRequired,
  }).isRequired,
  altStyling: PropTypes.bool,
  errorStyling: PropTypes.bool,
  panel: PropTypes.bool,
};

ThemedToast.defaultProps = {
  altStyling: false,
  errorStyling: false,
  panel: false,
};

export default ThemedToast;
