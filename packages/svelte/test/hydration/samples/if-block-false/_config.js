export default {
	props: {
		foo: false
	},

	snapshot(target) {
		const p = target.querySelector('p');

		return {
			p
		};
	}
};
