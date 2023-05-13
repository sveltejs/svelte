export default {
	preprocess: {
		markup: ({ content, filename }) => {
			return {
				code: content.replace('__MARKUP_FILENAME__', filename)
			};
		},
		style: ({ content, filename }) => {
			return {
				code: content.replace('__STYLE_FILENAME__', filename)
			};
		},
		script: ({ content, filename }) => {
			return {
				code: content.replace('__SCRIPT_FILENAME__', filename)
			};
		}
	},
	options: {
		filename: 'file.svelte'
	}
};
