export default {
	preprocess: {
		script: () => {
			return {
				code: 'tag'
			};
		},
		expression: () => {
			return {
				code: 'replaced'
			};
		}
	}
};
