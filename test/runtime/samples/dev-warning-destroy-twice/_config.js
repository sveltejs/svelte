export default {
	compileOptions: {
		dev: true
	},

	test({ assert, component }) {
		const warn = console.warn; // eslint-disable-line no-console

		const warnings = [];
		console.warn = warning => { // eslint-disable-line no-console
			warnings.push(warning);
		};

		component.$destroy();
		component.$destroy();

		assert.deepEqual(warnings, [
			`Component was already destroyed`
		]);

		console.warn = warn; // eslint-disable-line no-console
	}
};