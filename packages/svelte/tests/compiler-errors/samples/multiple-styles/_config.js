import { test } from '../../test';

export default test({
	error: {
		code: 'style_duplicate',
		message: 'A component can have a single top-level `<style>` element',
		position: [58, 58]
	}
});
