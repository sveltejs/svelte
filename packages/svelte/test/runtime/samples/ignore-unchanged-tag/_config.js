import counter from './counter.js';

export default {
	get props() {
		return { x: 1, y: 2 };
	},

	html: `
		<p>1</p>
		<p>2</p>
	`,

	test({ assert, component }) {
		counter.count = 0;

		component.x = 3;
		assert.equal(counter.count, 0);

		component.x = 4;
		component.y = 5;
		assert.equal(counter.count, 1);

		component.x = 5;
		component.y = 5;
		assert.equal(counter.count, 1);
	}
};
