export default {
	preprocess: {
		script: ({ content }) => {
			return {
				code: content.toLowerCase()
			};
		}
	}
};
