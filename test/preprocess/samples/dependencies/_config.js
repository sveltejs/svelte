export default {
	preprocess: {
		style: ({ content }) => {
			const dependencies = [];
			const code = content.replace(/@import '(.+)';/g, (match, $1) => {
				dependencies.push($1);
				return '/* removed */';
			});

			return { code, dependencies };
		}
	},

	dependencies: ['./foo.css']
};
