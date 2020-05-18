export default {
	compileOptions: {
		dev: true,
	},

	props: {
		count: 0,
	},

	error: `Could not subscribe to $count. A valid store is an object with a .subscribe method, consider setting count to null if this is expected.`,
};
