import * as assert from 'assert';

export default {
	solo: true,
	description: 'attaches event handlers',
	html: '<button>toggle</button><!--#if visible-->',
	test ( component, target ) {
		assert.ok( false, 'TODO fire synthetic event to test' );
	}
};
