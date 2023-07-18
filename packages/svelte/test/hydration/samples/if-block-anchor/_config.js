export default {
	props: {
		foo: true,
		bar: true
	},

	snapshot(target) {
		const div = target.querySelector('div');
		const ps = target.querySelectorAll('p');

		return {
			div,
			p0: ps[0],
			p1: ps[1]
		};
	}
};
