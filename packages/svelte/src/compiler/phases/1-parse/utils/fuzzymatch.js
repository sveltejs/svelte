/**
 * @param {string} name
 * @param {string[]} names
 * @returns {string | null}
 */
export default function fuzzymatch(name, names) {
	if (names.length === 0) return null;

	const set = new FuzzySet(names);
	const matches = set.get(name);

	return matches && matches[0][0] > 0.7 ? matches[0][1] : null;
}

// adapted from https://github.com/Glench/fuzzyset.js/blob/master/lib/fuzzyset.js
// BSD Licensed

const GRAM_SIZE_LOWER = 2;
const GRAM_SIZE_UPPER = 3;

// return an edit distance from 0 to 1

/**
 * @param {string} str1
 * @param {string} str2
 */
function _distance(str1, str2) {
	if (str1 === null && str2 === null) {
		throw 'Trying to compare two null values';
	}
	if (str1 === null || str2 === null) return 0;
	str1 = String(str1);
	str2 = String(str2);

	const distance = levenshtein(str1, str2);
	return 1 - distance / Math.max(str1.length, str2.length);
}

// helper functions

/**
 * @param {string} str1
 * @param {string} str2
 */
function levenshtein(str1, str2) {
	/** @type {number[]} */
	const current = [];
	let prev = 0;
	let value = 0;

	for (let i = 0; i <= str2.length; i++) {
		for (let j = 0; j <= str1.length; j++) {
			if (i && j) {
				if (str1.charAt(j - 1) === str2.charAt(i - 1)) {
					value = prev;
				} else {
					value = Math.min(current[j], current[j - 1], prev) + 1;
				}
			} else {
				value = i + j;
			}

			prev = current[j];
			current[j] = value;
		}
	}

	return /** @type {number} */ (current.pop());
}

const non_word_regex = /[^\w, ]+/;

/**
 * @param {string} value
 * @param {any} gram_size
 */
function iterate_grams(value, gram_size = 2) {
	const simplified = '-' + value.toLowerCase().replace(non_word_regex, '') + '-';
	const len_diff = gram_size - simplified.length;
	const results = [];

	if (len_diff > 0) {
		for (let i = 0; i < len_diff; ++i) {
			value += '-';
		}
	}
	for (let i = 0; i < simplified.length - gram_size + 1; ++i) {
		results.push(simplified.slice(i, i + gram_size));
	}
	return results;
}

/**
 * @param {string} value
 * @param {any} gram_size
 */
function gram_counter(value, gram_size = 2) {
	// return an object where key=gram, value=number of occurrences

	/** @type {Record<string, number>} */
	const result = {};
	const grams = iterate_grams(value, gram_size);
	let i = 0;

	for (i; i < grams.length; ++i) {
		if (grams[i] in result) {
			result[grams[i]] += 1;
		} else {
			result[grams[i]] = 1;
		}
	}
	return result;
}

/**
 * @param {MatchTuple} a
 * @param {MatchTuple} b
 */
function sort_descending(a, b) {
	return b[0] - a[0];
}

class FuzzySet {
	/** @type {Record<string, string>} */
	exact_set = {};

	/** @type {Record<string, [number, number][]>} */
	match_dict = {};

	/** @type {Record<string, number[]>} */
	items = {};

	/** @param {string[]} arr */
	constructor(arr) {
		// initialisation
		for (let i = GRAM_SIZE_LOWER; i < GRAM_SIZE_UPPER + 1; ++i) {
			this.items[i] = [];
		}

		// add all the items to the set
		for (let i = 0; i < arr.length; ++i) {
			this.add(arr[i]);
		}
	}

	/** @param {string} value */
	add(value) {
		const normalized_value = value.toLowerCase();
		if (normalized_value in this.exact_set) {
			return false;
		}

		let i = GRAM_SIZE_LOWER;
		for (i; i < GRAM_SIZE_UPPER + 1; ++i) {
			this._add(value, i);
		}
	}

	/**
	 * @param {string} value
	 * @param {number} gram_size
	 */
	_add(value, gram_size) {
		const normalized_value = value.toLowerCase();
		const items = this.items[gram_size] || [];
		const index = items.length;

		items.push(0);
		const gram_counts = gram_counter(normalized_value, gram_size);
		let sum_of_square_gram_counts = 0;
		let gram;
		let gram_count;

		for (gram in gram_counts) {
			gram_count = gram_counts[gram];
			sum_of_square_gram_counts += Math.pow(gram_count, 2);
			if (gram in this.match_dict) {
				this.match_dict[gram].push([index, gram_count]);
			} else {
				this.match_dict[gram] = [[index, gram_count]];
			}
		}
		const vector_normal = Math.sqrt(sum_of_square_gram_counts);
		// @ts-ignore no idea what this code is doing
		items[index] = [vector_normal, normalized_value];
		this.items[gram_size] = items;
		this.exact_set[normalized_value] = value;
	}

	/** @param {string} value */
	get(value) {
		const normalized_value = value.toLowerCase();
		const result = this.exact_set[normalized_value];

		if (result) {
			return /** @type {MatchTuple[]} */ ([[1, result]]);
		}

		// start with high gram size and if there are no results, go to lower gram sizes
		for (let gram_size = GRAM_SIZE_UPPER; gram_size >= GRAM_SIZE_LOWER; --gram_size) {
			const results = this.__get(value, gram_size);
			if (results.length > 0) return results;
		}
		return null;
	}

	/**
	 * @param {string} value
	 * @param {number} gram_size
	 * @returns {MatchTuple[]}
	 */
	__get(value, gram_size) {
		const normalized_value = value.toLowerCase();

		/** @type {Record<string, number>} */
		const matches = {};
		const gram_counts = gram_counter(normalized_value, gram_size);
		const items = this.items[gram_size];
		let sum_of_square_gram_counts = 0;
		let gram;
		let gram_count;
		let i;
		let index;
		let other_gram_count;

		for (gram in gram_counts) {
			gram_count = gram_counts[gram];
			sum_of_square_gram_counts += Math.pow(gram_count, 2);
			if (gram in this.match_dict) {
				for (i = 0; i < this.match_dict[gram].length; ++i) {
					index = this.match_dict[gram][i][0];
					other_gram_count = this.match_dict[gram][i][1];
					if (index in matches) {
						matches[index] += gram_count * other_gram_count;
					} else {
						matches[index] = gram_count * other_gram_count;
					}
				}
			}
		}

		const vector_normal = Math.sqrt(sum_of_square_gram_counts);

		/** @type {MatchTuple[]} */
		let results = [];
		let match_score;

		// build a results list of [score, str]
		for (const match_index in matches) {
			match_score = matches[match_index];
			// @ts-ignore no idea what this code is doing
			results.push([match_score / (vector_normal * items[match_index][0]), items[match_index][1]]);
		}

		results.sort(sort_descending);

		/** @type {MatchTuple[]} */
		let new_results = [];
		const end_index = Math.min(50, results.length);
		// truncate somewhat arbitrarily to 50
		for (let i = 0; i < end_index; ++i) {
			// @ts-ignore no idea what this code is doing
			new_results.push([_distance(results[i][1], normalized_value), results[i][1]]);
		}
		results = new_results;
		results.sort(sort_descending);

		new_results = [];
		for (let i = 0; i < results.length; ++i) {
			if (results[i][0] === results[0][0]) {
				// @ts-ignore no idea what this code is doing
				new_results.push([results[i][0], this.exact_set[results[i][1]]]);
			}
		}

		return new_results;
	}
}

/** @typedef {[score: number, match: string]} MatchTuple */
