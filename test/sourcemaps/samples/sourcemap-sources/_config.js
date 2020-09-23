import MagicString from 'magic-string';

function add(bundle, filename, source) {
  bundle.addSource({
    filename: filename,
    content: new MagicString(source)
  });
}

function result(bundle, filename) {
  return {
    code: bundle.toString(),
    map: bundle.generateMap({
      file: filename,
      includeContent: true,
      hires: true
    })
  };
}

export default {
	preprocess: [
		{
			script: ({ content, filename }) => {
				const bundle = new MagicString.Bundle();

				add(bundle, filename, content);
				add(bundle, 'foo.js', 'var answer = 42;');
				add(bundle, 'bar.js', 'console.log(answer);');

        return result(bundle, filename);
			}
		},
		{
			script: ({ content, filename }) => {
				const bundle = new MagicString.Bundle();

				add(bundle, filename, content);
				add(bundle, 'foo2.js', 'var answer2 = 84;');
				add(bundle, 'bar2.js', 'console.log(answer2);');

        return result(bundle, filename);
			}
		}
	]
};
