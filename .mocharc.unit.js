module.exports = {
	spec: [
		'src/**/__test__.ts',
	],
	require: [
		'sucrase/register'
	],
	recursive: true,
};

// add coverage options when running 'npx c8 mocha'
if (process.env.NODE_V8_COVERAGE) {
	module.exports.fullTrace = true;
	module.exports.require.push('source-map-support/register');
}
