import * as assert from 'assert';

export default {
	solo: true,
	show: true,
	description: '{{#if}}...{{/if}} block',
	data: {
		visible: true
	},
	html: '<p>i am visible</p><!--#if visible-->',
	test ( component, target ) {
		component.set({ visible: false });
		assert.equal( target.innerHTML, '<!--#if visible-->' );
		component.set({ visible: true });
		assert.equal( target.innerHTML, '<p>i am visible</p><!--#if visible-->' );
	}
};
