import axios from "axios";

const forvastApiEndPoint = (params) =>
  `https://api.weatherapi.com/v1/forecast.json?&key=20467afebe3d46718eb94522242704&q=${params.cityName}&days=${params?.days}&api=no&alerts=no`;
const weatherAPiEndPoints = (params) =>
  `https://api.weatherapi.com/v1/forecast.json?&key=20467afebe3d46718eb94522242704&q=${params.cityName}`;

const apiCall = async (endpoint) => {
  const options = {
    methos: "GET",
    url: endpoint,
  };
  try {
    const response = await axios.request(options);
    return response.data;
  } catch (err) {
    console.log(err);
  }
};

export const fetchWeatherForcast = (params) => {
  return apiCall(forvastApiEndPoint(params));
};

export const fetchLocation = (params) => {
  return apiCall(weatherAPiEndPoints(params));
};
