
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Allow requests from Replit domains
config.server = {
  ...config.server,
  rewriteRequestUrl: (url) => {
    if (!url.includes('?')) {
      return url;
    }
    return url;
  },
};

module.exports = config;
