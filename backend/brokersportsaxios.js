const axios = require("axios");

const sportsAxios = axios.create({
  baseURL: "https://brokersports.ddns.net/api/v2"
});

sportsAxios.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject((error.response && error.response.data) || 'Something went wrong')
);

// const accessToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI2MTczMDc4ZDY0YjljNzFkNjE5Y2Y2MDUiLCJpYXQiOjE2MzU4NTAyMDYsImV4cCI6MTczMDQ1ODIwNn0.ofLa9m-JQGHEpo6pEZ6coOWdWrVWZ4kWXsbg3P26PNY";

const accessToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI2MWEwZTY1N2NmMGU4Mjc5NmI4Y2ZlMzEiLCJpYXQiOjE2Mzc5MzUyODEsImV4cCI6MTczMjU0MzI4MX0.W8HFS7NvpIj8NzFJZc29P9ek_dS3HE2yVH0jwA8pPpI";

sportsAxios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

sportsAxios.defaults.timeout = 5000;

module.exports = {
  sportsAxios
}