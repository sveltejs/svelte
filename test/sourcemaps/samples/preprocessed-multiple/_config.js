import MagicString from 'magic-string';

export default {
	preprocess: {
		markup: ({ content, filename }) => {
			const src = new MagicString(content);
			const idx = content.indexOf('baritone');
			src.overwrite(idx, idx + 'baritone'.length, 'bar');

			const css_idx = content.indexOf('--bazitone');
			src.overwrite(css_idx, css_idx + '--bazitone'.length, '--baz');
			return {
				code: src.toString(),
				map: src.generateDecodedMap({
					source: filename,
					hires: true,
					includeContent: false
				})
			};
		},
		script: ({ content, filename }) => {
			const src = new MagicString(content);
			const idx = content.indexOf('bar');
			src.prependLeft(idx, '      ');
			return {
				code: src.toString(),
				map: src.generateDecodedMap({
					source: filename,
					hires: true,
					includeContent: false
				})
			};
		},
		style: ({ content, filename }) => {
			const src = new MagicString(content);
			const idx = content.indexOf('--baz');
			src.prependLeft(idx, '      ');
			return {
				code: src.toString(),
				map: src.generateDecodedMap({
					source: filename,
					hires: true,
					includeContent: false
				})
			};
		}
	}
};
