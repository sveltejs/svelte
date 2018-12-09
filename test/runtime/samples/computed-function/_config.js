export default {
	html: '<p>50</p>',

	test({ assert, component, target }) {
		console.group('range [50,100]');
		component.range = [50, 100];
		assert.htmlEqual(target.innerHTML, '<p>75</p>');
		console.groupEnd();

		component.range = [50, 60];
		assert.htmlEqual(target.innerHTML, '<p>55</p>');

		component.x = 8;
		assert.htmlEqual(target.innerHTML, '<p>58</p>');
	}
};
