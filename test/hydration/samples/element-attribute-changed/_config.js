export default {
	props: {
		class: 'bar'
	},

	snapshot(target) {
		const div = target.querySelector('div');

		return {
			div
		};
	}
};
