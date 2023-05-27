export default {
	html: `
		<button type="button">Set a</button>
		<button type="button">Set b</button>
	`,
	async test({ assert, target, window, component }) {
		const [btn1, btn2] = target.querySelectorAll('button');
		const click = new window.MouseEvent('click');

		await btn1.dispatchEvent(click);
		assert.deepEqual(component.log, ['setKey(a, value-a)']);

		await btn2.dispatchEvent(click);
		assert.deepEqual(component.log, ['setKey(a, value-a)', 'setKey(b, value-b)']);
	}
};
