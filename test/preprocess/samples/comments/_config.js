export default {
	preprocess: [
		{
			script: ({ content }) => ({ code: content.replace(/one/g, 'two') }),
			style: ({ content }) => ({ code: content.replace(/one/g, 'three') }),
		},
	],
};
