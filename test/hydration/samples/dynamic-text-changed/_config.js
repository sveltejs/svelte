export default {
	data: {
		name: 'everybody'
	},

	snapshot(target) {
		const h1 = target.querySelector('h1');

		return {
			h1,
			text: h1.childNodes[0]
		};
	},

	test(assert, target, snapshot) {
		const h1 = target.querySelector('h1');

		assert.equal(h1, snapshot.h1);
		assert.equal(h1.childNodes[0], snapshot.text);
	}
};