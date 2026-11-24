import { test } from '../../test';

export default test({
	preprocess: [
		{
			script: ({ content }) => ({ code: content, attributes: {} })
		}
	],
	client: [],
	preprocessed: ['<script', 'console.log(name);', '<div>{name}</div>']
});
