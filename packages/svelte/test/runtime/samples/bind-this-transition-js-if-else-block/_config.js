export default {
	get props() {
		return { show: 'a' };
	},

	test({ assert, component, target, raf }) {
		assert.equal(component.el, target.querySelector('div.first'));
		component.show = 'b';

		raf.tick(200);
		assert.equal(component.el, target.querySelector('div.second'));
	}
};
