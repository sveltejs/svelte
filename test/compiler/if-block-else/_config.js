import * as assert from 'assert';

export default {
	data: {
		foo: true,
		bar: false
	},
	html: '<p>foo</p><!--#if foo-->\n\n<p>not bar</p><!--#if bar-->',
	test ( component, target ) {
		component.set({ foo: false });
		assert.equal( target.innerHTML, '<p>not foo</p><!--#if foo-->\n\n<p>not bar</p><!--#if bar-->' );
		component.set({ bar: true });
		assert.equal( target.innerHTML, '<p>not foo</p><!--#if foo-->\n\n<p>bar</p><!--#if bar-->' );
		component.set({ foo: true });
		assert.equal( target.innerHTML, '<p>foo</p><!--#if foo-->\n\n<p>bar</p><!--#if bar-->' );
	}
};
