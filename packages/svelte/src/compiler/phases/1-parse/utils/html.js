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
// Also see: https://en.wikipedia.org/wiki/Plane_(Unicode)
// Also see: https://html.spec.whatwg.org/multipage/parsing.html#preprocessing-the-input-stream

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

	// supplementary special-purpose plane 0xe0000 - 0xe07f and 0xe0100 - 0xe01ef
	if ((code >= 917504 && code <= 917631) || (code >= 917760 && code <= 917999)) {
		return code;
	}

	return NUL;
}
