import { test } from '../../test';

export default test({
	skip_filename: true,
	logs: [
		"One or more `@migration-task` comments were added to a file (unfortunately we don't know the name), please check them and complete the migration manually."
	],
	errors: []
});
