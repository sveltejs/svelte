export default {
	props: {
		name: 'everybody'
	},

	snapshot(target) {
		const h1 = target.querySelector('h1');

		return {
			h1,
			text: h1.childNodes[0]
		};
	}
};
