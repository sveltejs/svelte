import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true // to ensure we we catch the error
	},
	error:
		'Cannot use bind:increment on this component because it is a component export, and you can only bind to properties in runes mode. ' +
		'Use bind:this instead and then access the property on the bound component instance.'
});
