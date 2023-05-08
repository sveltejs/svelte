export default {
	html: `
		<button type="button">Set a-c</button>
		<button type="button">Set b-c</button>
		<button type="button">Set a-d</button>
		<button type="button">Set b-d</button>
	`,
	async test({ assert, target, window, component }) {
		const [btn1, btn2, btn3, btn4] = target.querySelectorAll('button');
		const click = new window.MouseEvent('click');

		await btn1.dispatchEvent(click);
		assert.deepEqual(component.log, ['setKey(a, value-a-c, c)']);

		await btn2.dispatchEvent(click);
		assert.deepEqual(component.log, ['setKey(a, value-a-c, c)', 'setKey(b, value-b-c, c)']);

		await btn3.dispatchEvent(click);
		assert.deepEqual(component.log, [
			'setKey(a, value-a-c, c)',
			'setKey(b, value-b-c, c)',
			'setKey(a, value-a-d, d)'
		]);

		await btn4.dispatchEvent(click);
		assert.deepEqual(component.log, [
			'setKey(a, value-a-c, c)',
			'setKey(b, value-b-c, c)',
			'setKey(a, value-a-d, d)',
			'setKey(b, value-b-d, d)'
		]);
	}
};
