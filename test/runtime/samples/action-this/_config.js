export default {
	async test({ assert, target, window }) {
		const button = target.querySelector('button');
		const click = new window.MouseEvent('click');

		assert.htmlEqual(target.innerHTML, '<button>1</button>');
		await button.dispatchEvent(click);
		await Promise.resolve();
		assert.htmlEqual(target.innerHTML, '<button>2</button>');
	}
};
