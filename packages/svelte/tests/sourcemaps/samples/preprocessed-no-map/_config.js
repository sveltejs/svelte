import { test } from '../../test';

export default test({
	preprocess: [
		{
			style: ({ content }) => {
				// Modified without source map
				return { code: content + ' ' };
			},
			script: ({ content }) => {
				// Not modified
				return { code: content };
			}
		}
	],
	client: [],
	preprocessed: [
		// markup (start)
		'<script>',
		// script content (preprocessed without map, content not changed)
		'console.log(name);',
		// markup (middle)
		'<div>{name}</div>',
		// style content (preprocessed without map, content changed)
		{ str: 'font-weight: bold;', strGenerated: null },
		// markup (end)
		'</style>'
	]
});
