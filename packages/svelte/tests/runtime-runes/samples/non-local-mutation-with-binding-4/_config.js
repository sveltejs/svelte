import { test } from '../../test';

export default test({
	html: `<button>clicks: 0</button>`,

	compileOptions: {
		dev: true
	},

	warnings: []
});
