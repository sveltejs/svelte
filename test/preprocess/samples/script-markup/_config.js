export default {
	preprocess: {
		script: ({ content, markup }) => {
			return {
				code: content.replace(
					"__HASDIVTAG__",
					markup && /<div\/>/g.test(markup) ? "'yes'" : "'no'"
				),
			};
		},
	},
};
