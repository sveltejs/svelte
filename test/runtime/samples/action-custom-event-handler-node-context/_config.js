export default {
	skip_if_ssr: true,

	html: '<button>10</button>',

	async test({ assert, component, target, window }) {
		const event = new window.MouseEvent('click');

		const button = target.querySelector('button');

		await button.dispatchEvent(event);

		assert.equal(target.innerHTML, '<button>11</button>');
	}
};
