export default {
	html: '',

	test ( assert, component, target ) {
		assert.htmlEqual( target.innerHTML, 'NaN' );
	}
};
