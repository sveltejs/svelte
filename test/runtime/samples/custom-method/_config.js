export default {
	html: '<button>+1</button>\n\n<p>0</p>',

	async test({ assert, component, target, window }) {
		const button = target.querySelector('button');
		const event = new window.MouseEvent('click');

		await button.dispatchEvent(event);
		assert.equal(component.counter, 1);
		assert.equal(target.innerHTML, '<button>+1</button>\n\n<p>1</p>');

		await button.dispatchEvent(event);
		assert.equal(component.counter, 2);
		assert.equal(target.innerHTML, '<button>+1</button>\n\n<p>2</p>');

		assert.equal(component.foo(), 42);
	}
};
