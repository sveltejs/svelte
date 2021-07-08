let logs = [];
export default {
	props: {
		log(message) {
			logs.push(message);
		}
	},
	before_app() {
		logs = [];
	},
	test({ assert, component, target }) {
		assert.deepEqual(Object.keys(logs[0]), ['x', 'log']);
	}
};
