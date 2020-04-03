export default {
	async test({ assert, target, component }) {
		await Promise.resolve();

		component.fail = 'wrong';

		assert.htmlEqual(
			target.innerHTML,
			`
			correct
			correct
			`
		);
	}
};
