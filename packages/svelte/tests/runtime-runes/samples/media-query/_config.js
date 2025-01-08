import { expect } from 'vitest';
import { test } from '../../test';

export default test({
	async test({ window }) {
		expect(window.matchMedia).toHaveBeenCalledWith('(max-width: 599px), (min-width: 900px)');
		expect(window.matchMedia).toHaveBeenCalledWith('(min-width: 900px)');
	}
});
