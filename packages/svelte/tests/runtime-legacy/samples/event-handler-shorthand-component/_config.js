import { ok, test } from '../../test';

export default test({
	html: `
		<button>click me</button>
	`,

	test({ assert, component, target, window }) {
		const button = target.querySelector('button');
		const event = new window.MouseEvent('click');

		let answer;
		component.$on('foo', (/** @type {{ detail: { answer: any; }; }} */ event) => {
			answer = event.detail.answer;
		});

		// @ts-ignore
		button.dispatchEvent(event);
		assert.equal(answer, 42);
	}
});
