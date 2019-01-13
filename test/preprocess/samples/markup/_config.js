export default {
	preprocess: {
		markup: ({ content }) => {
			return {
				code: content.replace('__NAME__', 'world')
			};
		}
	}
};