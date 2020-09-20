module.exports = {
	file: [
		'test/test.js'
	]
};

// add coverage options when running 'npx c8 mocha'
if (process.env.NODE_V8_COVERAGE) {
	Object.assign(module.exports, {
		fullTrace: true,
		require: [
			'source-map-support/register'
		]
	});
}
