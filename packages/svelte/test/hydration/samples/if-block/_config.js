export default {
	props: {
		foo: true
	},

	snapshot(target) {
		const p = target.querySelector('p');

		return {
			p
		};
	}
};
