const dotenv = require('dotenv');
const path = require('path');
const Joi = require('@hapi/joi');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
    PORT: Joi.number().default(3000),
    MONGODB_URL: Joi.string().required().description('Mongo DB url'),
    TWITTER_API_KEY: Joi.string().description('the twitter api key for authentication'),
    TWITTER_SECRET_KEY: Joi.string().description('the twitter secret key for authentication'),
    TWITTER_CALLBACK_URL: Joi.string().description('the twitter callback url'),
    WEBSITE_REDIRECT_URL: Joi.string().description('the website url'),
    COOKIE_KEY:Joi.string().description('cookie key')
  })
  .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  mongoose: {
    url: envVars.MONGODB_URL + (envVars.NODE_ENV === 'test' ? '-test' : ''),
    options: {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  redirectUrl: envVars.WEBSITE_REDIRECT_URL,
  twitterapi: {
    apiKey: envVars.TWITTER_API_KEY,
    apiSecret: envVars.TWITTER_SECRET_KEY,
    callbackUrl: envVars.TWITTER_CALLBACK_URL,
  },
  cookieKey:envVars.COOKIE_KEY
};
