export default {
	props: { text: 'first' },
	test({ assert, target, component }) {
		assert.htmlEqual(target.innerHTML, '<button>first</button>');
		component.text = 'second';
		assert.htmlEqual(target.innerHTML, '<button>second</button>');
		let last_text;
		component.text = 'third';
		component.on_destroy = (text) => {
			last_text = text;
		};
		component.$destroy();
		assert.equal(last_text, 'third');
	}
};
