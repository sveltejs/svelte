import * as assert from 'assert';

export default {
	html: `<textarea readonly=""></textarea>`,
	test ( component, target ) {
		const textarea = target.querySelector( 'textarea' );
		assert.ok( textarea.readOnly );
	}
};
