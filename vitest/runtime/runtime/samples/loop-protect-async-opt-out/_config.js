export default {
	compileOptions: {
		dev: true,
		loopGuardTimeout: 1
	},
	async test({ component }) {
		await component.run_async_function();
	}
};
