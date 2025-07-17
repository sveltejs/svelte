import { test } from '../../test';

export default test({
	warnings: [
		'The `value` property of a `<select multiple>` element should be an array, but it received a non-array value. The selection will be kept as is.'
	]
});
