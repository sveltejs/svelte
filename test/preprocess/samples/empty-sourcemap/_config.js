export default {
	preprocess: {
		style: ({ content }) => {
			return { code: content, map: { mappings: '' } };
		}
	}
};
