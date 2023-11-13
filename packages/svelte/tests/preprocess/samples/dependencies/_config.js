import { test } from '../../test';

export default test({
	preprocess: {
		style: ({ content }) => {
			/** @type {string[]} */
			const dependencies = [];
			const code = content.replace(/@import '(.+)';/g, (match, $1) => {
				dependencies.push($1);
				return '/* removed */';
			});

			return { code, dependencies };
		}
	},

	dependencies: ['./foo.css']
});
