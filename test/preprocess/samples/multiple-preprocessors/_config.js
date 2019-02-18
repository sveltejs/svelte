export default {
	preprocess: [
		{
			markup: ({ content }) => ({ code: content.replace(/one/g, 'two') }),
			script: ({ content }) => ({ code: content.replace(/three/g, 'four') }),
			style:  ({ content }) => ({ code: content.replace(/four/g, 'five') })
		},
		{
			markup: ({ content }) => ({ code: content.replace(/two/g, 'three') }),
			script: ({ content }) => ({ code: content.replace(/four/g, 'five') }),
			style:  ({ content }) => ({ code: content.replace(/three/g, 'four') })
		}
	]
};