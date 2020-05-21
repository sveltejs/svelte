export default {
	props: {
		visible: true,
	},

	test({ assert, component, target }) {
		component.visible = false;
		assert.notEqual(target.querySelector('span'), undefined);
		component.resolve();
		setTimeout(() => {
			assert.equal(target.querySelector('span'), undefined);
		});
	},
};
