export default {
	compileOptions: {
		dev: true
	},

	get props() {
		return { count: 0 };
	},

	error: "'count' is not a store with a 'subscribe' method"
};
