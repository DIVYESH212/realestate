/*
 * @file: response.js
 * @description: It Contain function layer for api response status with data.
 * @author: Sandip Vaghasiya
 */

export const successAction = (data, message = "OK", type = "SUCCESS") => {
  return { statusCode: 200, data, message, type };
};

export const failAction = (
  message = "Fail",
  statusCode = 400,
  type = "ERROR"
) => {
  return { statusCode, data: null, message, type };
};

export const failActionFn = (
  data = null,
  message = "Fail",
  statusCode = 400
) => {
  return { statusCode, data: data, message };
};

export const toTitleCase = (str) => {
  if (str == undefined || str == 'undefined' || str == null || str == '') {
    return "";
  } else {
    str = str ? str.toString() : "";
    return str.replace(/\w\S*/g, function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  }
};
