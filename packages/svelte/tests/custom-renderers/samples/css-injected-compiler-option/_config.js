import { test } from '../../test';

export default test({
	compileOptions: {
		css: 'injected'
	},
	compile_error:
		'`css: "injected"` is not compatible with `customRenderer` — custom renderers do not support CSS injection'
});
