import { test } from '../../test';

export default test({
	error: {
		code: 'each_item_invalid_assignment',
		message:
			'Cannot reassign or bind to each block argument in runes mode. Use the array and index variables instead (e.g. `array[i] = value` instead of `entry = value`, or `bind:value={array[i]}` instead of `bind:value={entry}`)'
	}
});
