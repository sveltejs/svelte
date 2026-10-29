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
	const reg_exp_num = '#(?:[xX][a-fA-F\\d]+|\\d+)(?:;)?';
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
	if (html.indexOf('&') === -1) return html; // fast path

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
			} else if (entity[1] === 'x' || entity[1] === 'X') {
				code = parseInt(entity.substring(2), 16);
			} else {
				code = parseInt(entity.substring(1), 10);
			}

			if (!code) {
				return match;
			}

			return String.fromCodePoint(validate_code(code, is_attribute_value));
		}
	);
}

/**
 * @param {string} html
 * @param {boolean} is_attribute_value
 */
function* character_reference_segments(html, is_attribute_value) {
	let raw_index = 0;

	const entity_pattern = is_attribute_value ? entity_pattern_attr_value : entity_pattern_content;
	for (const match of html.matchAll(entity_pattern)) {
		const raw_start = match.index;
		if (raw_start > raw_index) {
			yield {
				raw_start: raw_index,
				raw_end: raw_start,
				decoded: html.slice(raw_index, raw_start),
				is_reference: false
			};
		}

		const raw_end = raw_start + match[0].length;
		yield {
			raw_start,
			raw_end,
			decoded: decode_character_references(match[0], is_attribute_value),
			is_reference: true
		};
		raw_index = raw_end;
	}

	if (raw_index < html.length) {
		yield {
			raw_start: raw_index,
			raw_end: html.length,
			decoded: html.slice(raw_index),
			is_reference: false
		};
	}
}

/**
 * Find the raw offset corresponding to a decoded whitespace prefix or suffix.
 * @param {string} html
 * @param {string} decoded_boundary
 * @param {boolean} is_attribute_value
 * @param {boolean} from_start
 * @returns {number | null}
 */
export function find_raw_character_reference_boundary(
	html,
	decoded_boundary,
	is_attribute_value,
	from_start
) {
	const segments = character_reference_segments(html, is_attribute_value);

	if (from_start) {
		let decoded_index = 0;
		for (const segment of segments) {
			const remaining = decoded_boundary.length - decoded_index;
			const consumed = Math.min(segment.decoded.length, remaining);
			if (
				segment.decoded.slice(0, consumed) !==
				decoded_boundary.slice(decoded_index, decoded_index + consumed)
			) {
				return null;
			}

			if (consumed === remaining) {
				if (consumed < segment.decoded.length) {
					return segment.is_reference ? null : segment.raw_start + consumed;
				}
				return segment.raw_end;
			}

			decoded_index += consumed;
		}
	} else {
		const reversed_segments = Array.from(segments).reverse();
		let decoded_index = decoded_boundary.length;
		for (const segment of reversed_segments) {
			const consumed = Math.min(segment.decoded.length, decoded_index);
			if (
				segment.decoded.slice(segment.decoded.length - consumed) !==
				decoded_boundary.slice(decoded_index - consumed, decoded_index)
			) {
				return null;
			}

			if (consumed === decoded_index) {
				if (consumed < segment.decoded.length) {
					return segment.is_reference ? null : segment.raw_end - consumed;
				}
				return segment.raw_start;
			}

			decoded_index -= consumed;
		}
	}

	return null;
}

const NUL = 0;

// some code points are verboten. If we were inserting HTML, the browser would replace the illegal
// code points with alternatives in some cases - since we're bypassing that mechanism, we need
// to replace them ourselves
//
// Source: http://en.wikipedia.org/wiki/Character_encodings_in_HTML#Illegal_characters
// Also see: https://en.wikipedia.org/wiki/Plane_(Unicode)
// Also see: https://html.spec.whatwg.org/multipage/parsing.html#preprocessing-the-input-stream

/**
 * @param {number} code
 * @param {boolean} is_attribute_value
 */
function validate_code(code, is_attribute_value) {
	// line feed becomes generic whitespace, since it is collapsed along with the
	// surrounding whitespace anyway. In an attribute value it is significant, so it
	// is left alone there
	if (code === 10 && !is_attribute_value) {
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
