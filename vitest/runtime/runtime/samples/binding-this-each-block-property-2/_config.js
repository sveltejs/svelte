let calls = [];
function callback(refs) {
	calls.push(refs.map(({ ref }) => ({ ref })));
}
export default {
	html: '',
	get props() {
		return { callback };
	},
	before_test() {
		calls = [];
	},
	async test({ assert, component, target }) {
		assert.equal(calls.length, 1);
		assert.equal(calls[0].length, 0);

		await component.addItem();

		let divs = target.querySelectorAll('div');

		assert.equal(calls.length, 3);
		assert.equal(calls[1].length, 1);
		assert.equal(calls[1][0].ref, null);
		assert.equal(calls[2].length, 1);
		assert.equal(calls[2][0].ref, divs[0]);

		await component.addItem();

		divs = target.querySelectorAll('div');

		assert.equal(calls.length, 5);
		assert.equal(calls[3].length, 2);
		assert.equal(calls[3][0].ref, divs[0]);
		assert.equal(calls[3][1].ref, null);
		assert.equal(calls[4].length, 2);
		assert.equal(calls[4][0].ref, divs[0]);
		assert.equal(calls[4][1].ref, divs[1]);

		await component.addItem();

		divs = target.querySelectorAll('div');

		assert.equal(calls.length, 7);
		assert.equal(calls[5].length, 3);
		assert.equal(calls[5][0].ref, divs[0]);
		assert.equal(calls[5][1].ref, divs[1]);
		assert.equal(calls[5][2].ref, null);
		assert.equal(calls[6].length, 3);
		assert.equal(calls[6][0].ref, divs[0]);
		assert.equal(calls[6][1].ref, divs[1]);
		assert.equal(calls[6][2].ref, divs[2]);
	}
};
