import * as assert from 'assert';

export default {
	html: '<!--#if visible-->',
	test ( component, target, window ) {
		component.set({ visible: true });
		assert.equal( component.refs.input, window.document.activeElement );
	}
};
