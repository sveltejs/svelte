export default {
	compileOptions: {
		dev: true
	},

	get props() {
		return {
			letters: [
				{ id: 1, char: 'a' },
				{ id: 2, char: 'b' },
				{ id: 3, char: 'c' }
			]
		};
	},

	warnings: []
};
