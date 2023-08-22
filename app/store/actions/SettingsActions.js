export const UPDATE_USER_INFO = 'UPDATE_USER_INFO';
export const UPDATE_LOCAL_SETTINGS = 'UPDATE_LOCAL_SETTINGS';

export const updateUserInfo = data => ({ type: UPDATE_USER_INFO, data });

export const updateLocalSettings = (rawData) => {
  const { metrics, bugs, blueBarPosition, ...parsedData } = rawData;
  return { type: UPDATE_LOCAL_SETTINGS, data: parsedData };
};
