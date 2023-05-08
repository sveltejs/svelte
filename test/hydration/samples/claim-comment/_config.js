export default {
	compileOptions: {
		preserveComments: true
	},
	snapshot(target) {
		return {
			div: target.querySelectorAll('div')[1]
		};
	}
};
