export default {
	snapshot(target) {
		const p = target.querySelector('p');

		return {
			p,
			span: p.querySelector('span'),
			code: p.querySelector('code')
		};
	},

	test(assert, target, snapshot) {
		const p = target.querySelector('p');

		assert.equal(p, snapshot.p);
		assert.equal(p.querySelector('span'), snapshot.span);
		assert.equal(p.querySelector('code'), snapshot.code);
	}
};
