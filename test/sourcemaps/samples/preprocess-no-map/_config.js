export default {
	css_map_sources: [],
	preprocess: [
		{
			style: ({ content }) => {
				return { code: content };
			},
			script: ({ content }) => {
				return { code: content };
			}
		}
	]
};
