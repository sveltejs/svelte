export default {
	async test({ assert, target, window }) {
		const btn = target.querySelector('button');
		const click_event = new window.MouseEvent('click');

		assert.equal(
			window.document.head.innerHTML.includes(
				'<style>body { color: blue; }</style><style>body { color: green; }</style>'
			),
			true
		);

		await btn.dispatchEvent(click_event);

		assert.equal(
			window.document.head.innerHTML.includes(
				'<style>body { color: red; }</style><style>body { color: green; }</style>'
			),
			true
		);

		await btn.dispatchEvent(click_event);

		assert.equal(
			window.document.head.innerHTML.includes(
				'<style>body { color: blue; }</style><style>body { color: green; }</style>'
			),
			true
		);
	}
};
