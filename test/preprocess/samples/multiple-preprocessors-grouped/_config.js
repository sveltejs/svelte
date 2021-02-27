export default {
	preprocess: [
		[
			{
				markup: ({ content }) => ({ code: content.replace(/one/g, 'two') }),
				script: ({ content }) => ({ code: content.replace(/three/g, 'four') }),
				style:  ({ content }) => ({ code: content.replace(/four/g, 'nine') })
			},
			{
				markup: ({ content }) => ({ code: content.replace(/two/g, 'three') }),
				script: ({ content }) => ({ code: content.replace(/four/g, 'five') }),
				style:  ({ content }) => ({ code: content.replace(/three/g, 'four') })
			}
		],
		{
			markup: ({ content }) => ({ code: content.replace(/three|four|five/g, 'reset-markup') }),
			script: ({ content }) => ({ code: content.replace(/reset-markup/g, 'reset-script') }),
			style:  ({ content }) => ({ code: content.replace(/reset-markup/g, 'reset-style') })
		},
		[
			{
				markup: ({ content }) => ({ 
					code: content
						.replace(/reset-markup/, 'six')
						.replace(/reset-style/, 'six')
						.replace(/reset-script/, 'six') }),
				script: ({ content }) => ({ code: content.replace(/seven/g, 'eight') }),
				style:  ({ content }) => ({ code: content.replace(/eight/g, 'nine') })
			},
			{
				markup: ({ content }) => ({ code: content.replace(/six/g, 'seven') }),
				script: ({ content }) => ({ code: content.replace(/eight/g, 'nine') }),
				style:  ({ content }) => ({ code: content.replace(/seven/g, 'eight') })
			}
		]
	]
};
