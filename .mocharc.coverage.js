module.exports = Object.assign(
	{},
	require('./mocharc.js'),
	{
		fullTrace: true,
		require: [
			'source-map-support/register'
		]
	}
);
