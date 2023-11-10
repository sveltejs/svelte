import { test } from '../../assert';
const tick = () => Promise.resolve();

export default test({
	dev: true,
	skip: true, // TODO: needs dev time warning
	async test({ assert, target }) {
		/** @type {string[]} */
		const warnings = [];
		const warn = console.warn;

		console.warn = (warning) => {
			warnings.push(warning);
		};

		target.innerHTML = '<my-app foo=yes />';
		await tick();

		assert.deepEqual(warnings, ["<my-app> was created without expected prop 'bar'"]);

		console.warn = warn;
	}
});
