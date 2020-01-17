export default {
	options: {
		strictOrder: true,
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
