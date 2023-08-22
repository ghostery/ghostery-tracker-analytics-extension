/* CSS STYLES HELPER FUNCTION */
/* ------------------------------------------------------------------------------------- */
export const assignStyles = (element, styles) => {
  let styleString = '';
  Object.keys(styles).forEach((styleKey) => {
    styleString += `${styleKey}: ${styles[styleKey]} !important;`;
  });
  element.setAttribute('style', styleString);
};

/* ELEMENT CREATOR HELPER FUNCTION */
const _createEl = (details) => {
  const { type, styles, src, alt, innerText } = details;

  const el = document.createElement(type);

  if (styles) assignStyles(el, styles);
  if (src) el.src = [chrome.extension.getURL(`${src}`)];
  if (alt) el.alt = alt;
  if (innerText) el.innerText = innerText;

  return el;
};

/* DIV ELEMENT CREATOR HELPER FUNCTION */
/* ------------------------------------------------------------------------------------- */
export const createDiv = (styles = {}, innerText = '') => {
  if (typeof styles === 'string') { // only an innerText param was passed
    return _createEl({ type: 'div', innerText: styles });
  }
  return _createEl({ type: 'div', styles, innerText });
};

/* IMG ELEMENT CREATOR HELPER FUNCTION */
/* ------------------------------------------------------------------------------------- */
export const createImg = (styles, src, alt = 'Decorative image') => _createEl({ type: 'img', styles, src, alt });

/* LINK ELEMENT CREATOR HELPER FUNCTION */
/* ------------------------------------------------------------------------------------- */
export const createLink = (styles, innerText) => _createEl({ type: 'a', styles, innerText });

/* SPAN ELEMENT CREATOR HELPER FUNCTION */
/* ------------------------------------------------------------------------------------- */
export const createSpan = (styles, innerText) => _createEl({ type: 'span', styles, innerText });

/* ADD OPEN SANS FONT TO THE DOCUMENT */
/* ------------------------------------------------------------------------------------- */
export const loadFonts = () => {
  // If we need to inject any other Open Sans fonts (eg. Italic, Light, etc.),
  // we can add them into this object using the appropriate parameters
  // (see /app/utils/scss/open-sans.scss for reference)
  const fontsToLoad = [
    { boldness: 'Regular', style: 'normal', weight: 400 },
    { boldness: 'SemiBold', style: 'normal', weight: 600 },
    { boldness: 'Bold', style: 'normal', weight: 700 },
  ];

  fontsToLoad.forEach((fontObject) => {
    const { boldness, style, weight } = fontObject;
    const openSansFont = new FontFace(
      'OpenSans',
      `url(${[chrome.extension.getURL(`dist/fonts/open-sans/OpenSans-${boldness}.ttf`)]})`,
      { style, weight },
    );
    openSansFont.load().then(loadedFont => document.fonts.add(loadedFont)).catch();
  });
};
