import { test } from '../../test';

export default test({
	html: '<p>50</p>',

	test({ assert, component, target }) {
		component.range = [50, 100];
		assert.htmlEqual(target.innerHTML, '<p>75</p>');

		component.range = [50, 60];
		assert.htmlEqual(target.innerHTML, '<p>55</p>');

		component.x = 8;
		assert.htmlEqual(target.innerHTML, '<p>58</p>');
	}
});
