export default {
	props: {
		className: 'bar'
	},

	snapshot(target) {
		const div = target.querySelector('div');

		return {
			div
		};
	}
};
