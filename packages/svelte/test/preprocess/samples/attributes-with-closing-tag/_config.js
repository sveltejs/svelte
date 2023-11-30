export default {
	preprocess: {
		script: ({ attributes }) =>
			attributes.generics && attributes.generics.includes('>') ? { code: '' } : null
	}
};
