import MagicString from 'magic-string';

export default {
	preprocess: {
		script: ({ content, filename }) => {
			const s = new MagicString(content);
			s.overwrite(
				content.indexOf('__THE_ANSWER__'),
				content.indexOf('__THE_ANSWER__') + '__THE_ANSWER__'.length,
				'42'
			);
			return {
				code: s.toString(),
				map: s.generateMap({ hires: true, file: filename })
			};
		}
	}
};
