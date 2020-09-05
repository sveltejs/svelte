module.exports = Object.assign(
  {},
  require('./mocharc.js'),
  {
    //recursive: true, // fails
    fullTrace: true,
    require: [
      'source-map-support/register',
    ],
  }
);
