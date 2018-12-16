export default {
	test({ assert, component, target, window }) {
		const allow = target.querySelector('.allow-propagation');
		const stop = target.querySelector('.stop-propagation');

		allow.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
		stop.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));

		assert.equal(component.foo, true);
		assert.equal(component.bar, false);
	}
};
