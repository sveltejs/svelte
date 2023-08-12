export default {
	preprocess: [
		{
			markup: ({ content }) => ({ code: content.replace(/one/g, 'two') }),
			script: ({ content }) => ({ code: content.replace(/two/g, 'three') }),
			style: ({ content }) => ({ code: content.replace(/three/g, 'style') })
		},
		{
			markup: ({ content }) => ({ code: content.replace(/two/g, 'three') }),
			script: ({ content }) => ({ code: content.replace(/three/g, 'script') }),
			style: ({ content }) => ({ code: content.replace(/three/g, 'style') })
		}
	]
};
