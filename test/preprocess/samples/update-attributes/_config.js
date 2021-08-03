export default {
	preprocess: {
		script: ({ content, attributes }) => {
			attributes = { ...attributes, c: false, insert: 'foobar' };
			delete attributes['lang'];
			if (attributes.context) {
				attributes.context = 'module';
			}

			return {
				code: content,
				attributes
			};
		}
	}
};
