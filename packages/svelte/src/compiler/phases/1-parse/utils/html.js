import entities from './entities.js';

const windows_1252 = [
	8364, 129, 8218, 402, 8222, 8230, 8224, 8225, 710, 8240, 352, 8249, 338, 141, 381, 143, 144, 8216,
	8217, 8220, 8221, 8226, 8211, 8212, 732, 8482, 353, 8250, 339, 157, 382, 376
];

/**
 * @param {string} entity_name
 * @param {boolean} is_attribute_value
 */
function reg_exp_entity(entity_name, is_attribute_value) {
	// https://html.spec.whatwg.org/multipage/parsing.html#named-character-reference-state
	// doesn't decode the html entity which not ends with ; and next character is =, number or alphabet in attribute value.
	if (is_attribute_value && !entity_name.endsWith(';')) {
		return `${entity_name}\\b(?!=)`;
	}
	return entity_name;
}

/** @param {boolean} is_attribute_value */
function get_entity_pattern(is_attribute_value) {
	const reg_exp_num = '#(?:x[a-fA-F\\d]+|\\d+)(?:;)?';
	const reg_exp_entities = Object.keys(entities).map(
		/** @param {any} entity_name */ (entity_name) => reg_exp_entity(entity_name, is_attribute_value)
	);

	const entity_pattern = new RegExp(`&(${reg_exp_num}|${reg_exp_entities.join('|')})`, 'g');

	return entity_pattern;
}

const entity_pattern_content = get_entity_pattern(false);
const entity_pattern_attr_value = get_entity_pattern(true);

/**
 * @param {string} html
 * @param {boolean} is_attribute_value
 */
export function decode_character_references(html, is_attribute_value) {
	const entity_pattern = is_attribute_value ? entity_pattern_attr_value : entity_pattern_content;
	return html.replace(
		entity_pattern,
		/**
		 * @param {any} match
		 * @param {keyof typeof entities} entity
		 */ (match, entity) => {
			let code;

			// Handle named entities
			if (entity[0] !== '#') {
				code = entities[entity];
			} else if (entity[1] === 'x') {
				code = parseInt(entity.substring(2), 16);
			} else {
				code = parseInt(entity.substring(1), 10);
			}

			if (!code) {
				return match;
			}

			return String.fromCodePoint(validate_code(code));
		}
	);
}

const NUL = 0;

// some code points are verboten. If we were inserting HTML, the browser would replace the illegal
// code points with alternatives in some cases - since we're bypassing that mechanism, we need
// to replace them ourselves
//
// Source: http://en.wikipedia.org/wiki/Character_encodings_in_HTML#Illegal_characters

/** @param {number} code */
function validate_code(code) {
	// line feed becomes generic whitespace
	if (code === 10) {
		return 32;
	}

	// ASCII range. (Why someone would use HTML entities for ASCII characters I don't know, but...)
	if (code < 128) {
		return code;
	}

	// code points 128-159 are dealt with leniently by browsers, but they're incorrect. We need
	// to correct the mistake or we'll end up with missing € signs and so on
	if (code <= 159) {
		return windows_1252[code - 128];
	}

	// basic multilingual plane
	if (code < 55296) {
		return code;
	}

	// UTF-16 surrogate halves
	if (code <= 57343) {
		return NUL;
	}

	// rest of the basic multilingual plane
	if (code <= 65535) {
		return code;
	}

	// supplementary multilingual plane 0x10000 - 0x1ffff
	if (code >= 65536 && code <= 131071) {
		return code;
	}

	// supplementary ideographic plane 0x20000 - 0x2ffff
	if (code >= 131072 && code <= 196607) {
		return code;
	}

	return NUL;
}

// based on http://developers.whatwg.org/syntax.html#syntax-tag-omission

const interactive_elements = new Set([
	'a',
	'button',
	'iframe',
	'embed',
	'input',
	'select',
	'textarea'
]);

/** @type {Record<string, Set<string>>} */
const disallowed_contents = {
	li: new Set(['li']),
	dt: new Set(['dt', 'dd']),
	dd: new Set(['dt', 'dd']),
	p: new Set(
		'address article aside blockquote div dl fieldset footer form h1 h2 h3 h4 h5 h6 header hgroup hr main menu nav ol p pre section table ul'.split(
			' '
		)
	),
	rt: new Set(['rt', 'rp']),
	rp: new Set(['rt', 'rp']),
	optgroup: new Set(['optgroup']),
	option: new Set(['option', 'optgroup']),
	thead: new Set(['tbody', 'tfoot']),
	tbody: new Set(['tbody', 'tfoot']),
	tfoot: new Set(['tbody']),
	tr: new Set(['tr', 'tbody']),
	td: new Set(['td', 'th', 'tr']),
	th: new Set(['td', 'th', 'tr'])
};

for (const interactive_element of interactive_elements) {
	disallowed_contents[interactive_element] = interactive_elements;
}

// can this be a child of the parent element, or does it implicitly
// close it, like `<li>one<li>two`?

/**
 * @param {string} current
 * @param {string} [next]
 */
export function closing_tag_omitted(current, next) {
	if (disallowed_contents[current]) {
		if (!next || disallowed_contents[current].has(next)) {
			return true;
		}
	}

	return false;
}
