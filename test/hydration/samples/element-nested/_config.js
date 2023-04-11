export default {
	snapshot(target) {
		const div = target.querySelector('div');

		return {
			div,
			p: div.querySelector('p')
		};
	}
};
