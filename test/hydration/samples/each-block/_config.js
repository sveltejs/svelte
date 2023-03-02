export default {
	props: {
		things: [
			'animal',
			'vegetable',
			'mineral'
		]
	},

	snapshot(target) {
		const ul = target.querySelector('ul');
		const lis = ul.querySelectorAll('li');

		return {
			ul,
			lis
		};
	},

	test(assert, target, snapshot) {
		const ul = target.querySelector('ul');
		const lis = ul.querySelectorAll('li');

		assert.equal(ul, snapshot.ul);
		assert.equal(lis[0], snapshot.lis[0]);
		assert.equal(lis[1], snapshot.lis[1]);
		assert.equal(lis[2], snapshot.lis[2]);
	}
};
