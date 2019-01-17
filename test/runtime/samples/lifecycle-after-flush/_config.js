export default {
	async test({ assert, component, target, window }) {
		const button = target.querySelector('button');
		const click = new window.MouseEvent('click');

		await button.dispatchEvent(click);
		assert.deepEqual(component.snapshots, [
			'before 0',
			'after 1'
		]);

		await button.dispatchEvent(click);
		assert.deepEqual(component.snapshots, [
			'before 0',
			'after 1',
			'before 1',
			'after 2'
		]);
	}
};
