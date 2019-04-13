import limax from 'limax';
import {SLUG_LANG, SLUG_SEPARATOR} from '../../config';

/* latinizer processor */

export const limaxProcessor = (string, lang = SLUG_LANG) => limax(string, {
	custom: ['$'],
	separator: SLUG_SEPARATOR,
	maintainCase: true,
	lang
});

/* unicode-preserver processor */

const alphaNumRegex = /[a-zA-Z0-9]/;
const unicodeRegex = /\p{Letter}/u;
const isNonAlphaNumUnicode =
	string => !alphaNumRegex.test(string) && unicodeRegex.test(string);

const nonUnicodeSanitizer = string =>
	string
		.toLowerCase()
		.replace(/[^a-zA-Z0-9]+/g, '-')
		.replace(/^-/, '')
		.replace(/-$/, '');

export const unicodeSafeProcessor = string =>
	string.split('')
	.reduce((accum, char, index, array) => {
		const type = isNonAlphaNumUnicode(char) ? 'pass' : 'process';

		if (index === 0) {
			accum.current = {type, string: char};
		} else if (type === accum.current.type) {
			accum.current.string += char;
		} else {
			accum.chunks.push(accum.current);
			accum.current = {type, string: char}
		}

		if (index === array.length - 1) {
			accum.chunks.push(accum.current);
		}

		return accum;
	}, {chunks: [], current: {type: '', string: ''}})
	.chunks
	.reduce((accum, chunk) => {
		const processed = chunk.type === 'process'
			? limaxProcessor(chunk.string)
			// ? nonUnicodeSanitizer(chunk.string)
			: chunk.string;

		processed.length > 0 && accum.push(processed);

		return accum;
	}, [])
	.join(SLUG_SEPARATOR);

/* session processor */

export const makeSessionSlugProcessor = (preserveUnicode = false) => {
	const processor = preserveUnicode ? unicodeSafeProcessor : limaxProcessor;
	const seen = new Set();

	return string => {
		const slug = processor(string);

		if (seen.has(slug)) throw new Error(`Duplicate slug ${slug}`);
		seen.add(slug);

		return slug;
	}
}
