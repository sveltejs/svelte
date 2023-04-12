export default {
	compileOptions: {
		preserveComments:true
	},
	snapshot(target) {
		const div = target.querySelector('div');

		return {
			div,
			comment: div.childNodes[0]
		};
	},

	test(assert, target, snapshot) {
		const div = target.querySelector('div');
		assert.equal(div, snapshot.div);
		assert.equal(div.childNodes[0], snapshot.comment);
		assert.equal(div.childNodes[1].nodeType, 8);
	}
};
