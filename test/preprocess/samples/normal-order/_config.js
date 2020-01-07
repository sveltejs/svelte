export default {
	solo: true,
	options: {
		strictOrder: false,
	},
	preprocess: [
		{
			style: ({ content }) => ({ code: content.replace(/one/g, 'two') }),
		},
		{
			markup: ({ content }) => ({ code: content.replace(/two/g, 'three') }),
		},
	],
};
