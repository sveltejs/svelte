import { test } from '../../test';

export default test({
	html: `<button>clicks: 0</button>`,

	compileOptions: {
		dev: true
	},

	warnings: [
		"The `object` prop was passed an object that isn't reactive yet was marked as bindable. The object should be either made reactive using `$state` or should contain properties that have a `set` accessor."
	]
});
