import { flushSync } from '../../../../src/index-client';
import { test } from '../../test';

export default test({
	solo: true,
	html: `
		<div>[object Set Iterator] [object Set Iterator] [object Set Iterator]</div>
		<div>[object Set Iterator] [object Set Iterator] [object Set Iterator]</div>
		<div>[object Map Iterator] [object Map Iterator] [object Map Iterator]</div>
		<div>[object Map Iterator] [object Map Iterator] [object Map Iterator]</div>
	`
});
