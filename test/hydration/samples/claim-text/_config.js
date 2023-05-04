export default {
	snapshot(target) {
		return {
			main: target.querySelector('main'),
			p: target.querySelector('p')
		};
	}
};
