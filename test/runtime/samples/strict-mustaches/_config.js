export default {
	skip_if_ssr: true,

	props: {
		text: 'test'
	},

	html: '<div>beforetestafter</div>',

	test({ assert, component, target }) {
		const text = component.container.childNodes[1];
		text.data += 'ing';

		assert.equal(target.innerHTML, '<div>beforetestingafter</div>');

		// Track when .data is set on text
		let get, set, proto = text.__proto__;
		while (proto) {
			const descriptor = Object.getOwnPropertyDescriptor(proto, 'data');
			if (descriptor) {
				get = descriptor.get;
				set = descriptor.set;
				break;
			} else {
				proto = proto.__proto__;
			}
		}
		if (!get || !set) throw new Error('Could not get the getter/setter for data');
		let setValue;

		Object.defineProperty(text, 'data', {
			get,
			set(value) {
				console.log('SETTING VALUE:', value);
				setValue = value;
				set.call(this, value);
			}
		});

		component.text += 'ing';
		assert.equal(setValue, undefined);

		component.text += '!';
		assert.equal(setValue, 'testing!');

		component.$destroy();
		assert.equal(target.innerHTML, '');
	}
};
