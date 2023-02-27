export default {
	preprocess: {
		style: ({ content }) => {
			return {
				code: content.replace('$brand', 'purple')
			};
		}
	}
};
