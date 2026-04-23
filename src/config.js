// config.js — replaces expo-constants based config
// Expo → CLI: removed `import Constants from 'expo-constants'`

const ENV = {
  dev: {
    FASTAPI_URL: 'http://192.168.1.26:8000', // Change to your dev machine IP
  },
  prod: {
    FASTAPI_URL: 'https://your-production-api.com',
  },
};

const getEnvVars = () => {
  if (__DEV__) {
    return ENV.dev;
  }
  return ENV.prod;
};

export default getEnvVars();
