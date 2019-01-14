export default {
	preprocess: {
		script: ({ content }) => {
			return {
				code: content.replace('__THE_ANSWER__', '42')
			};
		}
	}
};