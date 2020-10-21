export default {
	html: '<button>false 0</button>',

	async test({ assert, target, window }) {
		const button = target.querySelector('button');
		const click = new window.MouseEvent('click');

		await button.dispatchEvent(click);
		assert.htmlEqual(target.innerHTML, '<button>true 1</button>');

		await button.dispatchEvent(click);
		assert.htmlEqual(target.innerHTML, '<button>false 1</button>');

		await button.dispatchEvent(click);
		assert.htmlEqual(target.innerHTML, '<button>true 2</button>');
	}
};
