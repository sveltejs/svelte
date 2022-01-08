export default {
	snapshot(target) {
		const p = target.querySelector('p');

		return {
			p,
			text: p.childNodes[0],
			span: p.querySelector('span')
		};
	},

	test(assert, target, snapshot) {
		const p = target.querySelector('p');

		assert.equal(p, snapshot.p);
		assert.equal(p.childNodes[0], snapshot.text);
		assert.equal(p.querySelector('span'), snapshot.span);
	}
};
