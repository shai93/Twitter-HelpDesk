const express = require('express');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const passport = require('passport');
const httpStatus = require('http-status');
const config = require('./config/config');
const morgan = require('./config/morgan');
const { authLimiter } = require('./middlewares/rateLimiter');
const routes = require('./routes/v1');
const { errorConverter, errorHandler } = require('./middlewares/error');
const ApiError = require('./utils/ApiError');
const { twitterStrategy } = require('./config/passport');
const cookieSession = require("cookie-session");
const cookieParser = require("cookie-parser");
const app = express();
const path = require('path');

if (config.env !== 'test') {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

// set security HTTP headers
app.use(helmet());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// sanitize request data
app.use(xss());
app.use(mongoSanitize());

// gzip compression
app.use(compression());

// enable cors
app.use((req, res, next) => {
  const allowedOrigins = ['http://127.0.0.1:3000'];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', true);
  return next();
});
// parse cookies
app.use(cookieParser());

app.use(passport.initialize());
// deserialize cookie from the browser
app.use(passport.session());

app.use(
  cookieSession({
    name: "session",
    keys: [config.cookieKey],
    maxAge: 24 * 60 * 60 * 100
  })
  );
  
passport.use('twitter', twitterStrategy);

// limit repeated failed requests to auth endpoints
if (config.env === 'production') {
  app.use('/v1/auth', authLimiter);
}

// v1 api routes
app.use('/v1', routes);


app.use("/", express.static(path.join(__dirname, "../client/dist/client")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../client/dist/client", "index.html"));
  });


// // Serve static files....
// app.use(express.static(__dirname + '../public'));

// // Send all requests to index.html
// app.get('/*', function(req, res) {
//   res.sendFile(path.join(__dirname + '../public/index.html'));
// })

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);


var server = require('http').createServer(app);
module.exports = server;
  