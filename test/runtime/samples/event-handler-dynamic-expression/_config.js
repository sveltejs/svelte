export default {
	html: '<button>bar</button>',

	async test({ assert, component, target, window }) {
		const [button] = target.querySelectorAll(
			'button'
		);

		const event = new window.MouseEvent('click');

		await button.dispatchEvent(event);
		assert.htmlEqual(target.innerHTML, '<button>foo</button>');
		
		await button.dispatchEvent(event);
		assert.htmlEqual(target.innerHTML, '<button>bar</button>');
		
		await button.dispatchEvent(event);
		assert.htmlEqual(target.innerHTML, '<button>foo</button>');
	}
};
