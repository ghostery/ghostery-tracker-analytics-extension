const MAX_32BIT_INT = 2147483647;

const popup = {
  position: 'fixed',
  'z-index': `${MAX_32BIT_INT}`,
  top: '25px',
  right: '25px',
  'box-shadow': '0 2px 4px 0 rgba(0, 0, 0, 0.5)',
  'background-image': 'linear-gradient(132deg, #2b5993, #00aef0 97%)',
  border: 'solid 1px #00aef0',
  display: 'flex',
  'flex-direction': 'column',
  'align-items': 'center',
};

const popupHeader = {
  'padding-top': '9px',
  width: '100%',
  display: 'flex',
  'justify-content': 'space-between',
};

const popupHeaderLogo = {
  'margin-left': '11px',
  width: '60px',
};

const popupHeaderXButton = {
  'border-radius': '7px',
  'margin-right': '11px',
  width: '13px',
  height: '13px',
  cursor: 'pointer',
};

const fontFamily = {
  'font-family': 'OpenSans, Helvetica, Arial, sans-serif',
};

const sharedStyles = {
  MAX_32BIT_INT,
  popup,
  popupHeader,
  popupHeaderLogo,
  popupHeaderXButton,
  fontFamily,
};

export default sharedStyles;
