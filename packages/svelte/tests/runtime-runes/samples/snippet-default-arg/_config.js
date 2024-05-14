import { test } from '../../test';

export default test({
	compileOptions: {
		dev: false // or else the arg will be called eagerly anyway to check for dead zones
	},
	html: `
	<div>1 1 1</div>
	<div>2 2 2</div>
	<div>1 1 1</div>
	<p>2</p>
	`
});
