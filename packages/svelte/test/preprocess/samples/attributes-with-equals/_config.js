export default {
	preprocess: {
		style: ({ attributes }) =>
			attributes.foo && attributes.foo.includes('=') ? { code: '' } : null
	}
};
