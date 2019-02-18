export default {
	preprocess: {
		style: ({ content }) => {
			return Promise.resolve({
				code: content.replace('$brand', 'purple')
			});
		}
	}
};