import { test } from '../../test';

export default test({
	server_props: {
		browser: false
	},
	props: {
		browser: true
	},
	compileOptions: {
		dev: true
	},
	errors: [
		'The value of the `{@html}` block changed its value between server and client renders. The client value, `browser`, will be ignored in favour of the server value'
	]
});
