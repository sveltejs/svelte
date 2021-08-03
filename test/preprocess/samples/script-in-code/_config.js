export default {
	preprocess: {
		script: ({ is_expression, content }) => {
			return {
				code: is_expression ? content : 'let z = 42;'
			};
		}
	}
};
