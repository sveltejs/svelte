export default {
	async test({ assert, component, target, window }) {
		const buttons = target.querySelectorAll('button');
		const click = new window.MouseEvent('click');

		await buttons[0].dispatchEvent(click);
		assert.deepEqual(component.snapshots, [
			'before 0',
			'after 1'
		]);

		await buttons[0].dispatchEvent(click);
		assert.deepEqual(component.snapshots, [
			'before 0',
			'after 1',
			'before 1',
			'after 2'
		]);

		await buttons[1].dispatchEvent(click);
		assert.deepEqual(component.snapshots, [
			'before 0',
			'after 1',
			'before 1',
			'after 2',
			'before 2',
			'after 2'
		]);
	}
};
