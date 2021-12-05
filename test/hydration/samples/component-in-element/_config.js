export default {
	snapshot(target) {
		const div = target.querySelector('div');
		const p = target.querySelector('p');

		return {
			div,
			p,
			text: p.childNodes[0]
		};
	},

	test(assert, target, snapshot) {
		const div = target.querySelector('div');
		const p = target.querySelector('p');

		assert.equal(div, snapshot.div);
		assert.equal(p, snapshot.p);
		assert.equal(p.childNodes[0], snapshot.text);
	}
};
