import * as assert from 'assert';

export default {
	html: `<div style="color: red;">red</div>`,
	test ( component, target ) {
		const div = target.querySelector( 'div' );

		assert.equal( div.style.color, 'red' );

		component.set({ color: 'blue' });
		assert.equal( target.innerHTML, `<div style="color: blue;">blue</div>` );
		assert.equal( div.style.color, 'blue' );
	}
};
