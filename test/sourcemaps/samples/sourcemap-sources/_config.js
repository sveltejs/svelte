import MagicString, { Bundle } from 'magic-string';

function add(bundle, filename, source) {
	bundle.addSource({
		filename,
		content: new MagicString(source),
		separator: '\n',
		//separator: '', // ERROR. probably a bug in magic-string
	});
}

function result(bundle, filename) {
	return {
		code: bundle.toString(),
		map: bundle.generateMap({
			file: filename,
			includeContent: false,
			hires: false
		})
	};
}

export default {
	js_map_sources: [
		'input.svelte',
		'foo.js',
		'bar.js',
		'foo2.js',
		'bar2.js',
	],
	preprocess: [
		{
			script: ({ content, filename }) => {
				const bundle = new Bundle();

				add(bundle, filename, content);
				add(bundle, 'foo.js', 'var answer = 42;');
				add(bundle, 'bar.js', 'console.log(answer);');

				return result(bundle, filename);
			}
		},
		{
			script: ({ content, filename }) => {
				const bundle = new Bundle();

				add(bundle, filename, content);
				add(bundle, 'foo2.js', 'var answer2 = 84;');
				add(bundle, 'bar2.js', 'console.log(answer2);');

				return result(bundle, filename);
			}
		}
	]
};
