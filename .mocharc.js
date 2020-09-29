module.exports = {
	file: [
		'test/test.ts'
	],
	require: [
		'sucrase/register'
	]
};

// add coverage options when running 'npx c8 mocha'
if (process.env.NODE_V8_COVERAGE) {
	module.exports.fullTrace = true;
	module.exports.require.push('source-map-support/register');
}
