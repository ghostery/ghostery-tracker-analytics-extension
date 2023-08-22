const capitalize = ((phrase, divider = ' ') => {
  const words = phrase.split(divider);
  const trimmedWords = words.map(word => word.trim());
  const capitalizedWords = trimmedWords.map(word => `${word.charAt(0).toUpperCase()}${word.slice(1)}`);
  return capitalizedWords.join(divider);
});

export default capitalize;
