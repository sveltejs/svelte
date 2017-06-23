export default {
	snapshot(target) {
		return {
			text: target.childNodes[0]
		};
	},

	test(assert, target, snapshot) {
		const text = target.childNodes[0];

		assert.equal(text, snapshot.text);
	}
};