import * as assert from 'assert';
import Widget from './Widget.html';

export default {
	html: '<div><p>i am a widget</p></div>',
	test ( component ) {
		const widget = component.refs.widget;
		assert.ok( widget instanceof Widget );
	}
};
