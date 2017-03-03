export default {
	test ( assert, component, target, window ) {
		const iframe = window.document.createElement('iframe');
		window.document.body.appendChild(iframe);

		const otherTarget = iframe.contentWindow.document.body;

		new component.constructor({
			target: otherTarget
		});

		assert.equal(
			window.getComputedStyle(target.querySelector('h1')).color,
			'rgb(255, 0, 0)'
		);
		assert.equal(
			window.getComputedStyle(otherTarget.querySelector('h1')).color,
			'rgb(255, 0, 0)'
		);
	}
};
