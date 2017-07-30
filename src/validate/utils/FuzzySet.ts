// adapted from https://github.com/Glench/fuzzyset.js/blob/master/lib/fuzzyset.js
// BSD Licensed

const GRAM_SIZE_LOWER = 2;
const GRAM_SIZE_UPPER = 3;

// return an edit distance from 0 to 1
function _distance(str1: string, str2: string) {
	if (str1 === null && str2 === null)
		throw 'Trying to compare two null values';
	if (str1 === null || str2 === null) return 0;
	str1 = String(str1);
	str2 = String(str2);

	const distance = levenshtein(str1, str2);
	if (str1.length > str2.length) {
		return 1 - distance / str1.length;
	} else {
		return 1 - distance / str2.length;
	}
}

// helper functions
function levenshtein(str1: string, str2: string) {
	const current: number[] = [];
	let prev;
	let value;

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

	return current.pop();
}

const _nonWordRe = /[^\w, ]+/;

function _iterateGrams(value: string, gramSize: number) {
	gramSize = gramSize || 2;
	const simplified = '-' + value.toLowerCase().replace(_nonWordRe, '') + '-';
	const lenDiff = gramSize - simplified.length;
	const results = [];

	if (lenDiff > 0) {
		for (let i = 0; i < lenDiff; ++i) {
			value += '-';
		}
	}
	for (let i = 0; i < simplified.length - gramSize + 1; ++i) {
		results.push(simplified.slice(i, i + gramSize));
	}
	return results;
}

function _gramCounter(value: string, gramSize: number) {
	// return an object where key=gram, value=number of occurrences
	gramSize = gramSize || 2;
	const result = {};
	const grams = _iterateGrams(value, gramSize);
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

function sortDescending(a, b) {
	return b[0] - a[0];
}

export default class FuzzySet {
	exactSet: object;
	matchDict: object;
	items: object;

	constructor(arr: string[]) {
		// define all the object functions and attributes
		this.exactSet = {};
		this.matchDict = {};
		this.items = {};

		// initialization
		for (let i = GRAM_SIZE_LOWER; i < GRAM_SIZE_UPPER + 1; ++i) {
			this.items[i] = [];
		}
		// add all the items to the set
		for (let i = 0; i < arr.length; ++i) {
			this.add(arr[i]);
		}
	}

	add(value: string) {
		const normalizedValue = value.toLowerCase();
		if (normalizedValue in this.exactSet) {
			return false;
		}

		let i = GRAM_SIZE_LOWER;
		for (i; i < GRAM_SIZE_UPPER + 1; ++i) {
			this._add(value, i);
		}
	}

	_add(value: string, gramSize: number) {
		const normalizedValue = value.toLowerCase();
		const items = this.items[gramSize] || [];
		const index = items.length;

		items.push(0);
		const gramCounts = _gramCounter(normalizedValue, gramSize);
		let sumOfSquareGramCounts = 0;
		let gram;
		let gramCount;

		for (gram in gramCounts) {
			gramCount = gramCounts[gram];
			sumOfSquareGramCounts += Math.pow(gramCount, 2);
			if (gram in this.matchDict) {
				this.matchDict[gram].push([index, gramCount]);
			} else {
				this.matchDict[gram] = [[index, gramCount]];
			}
		}
		const vectorNormal = Math.sqrt(sumOfSquareGramCounts);
		items[index] = [vectorNormal, normalizedValue];
		this.items[gramSize] = items;
		this.exactSet[normalizedValue] = value;
	};

	get(value: string) {
		const normalizedValue = value.toLowerCase();
		const result = this.exactSet[normalizedValue];

		if (result) {
			return [[1, result]];
		}

		let results = [];
		// start with high gram size and if there are no results, go to lower gram sizes
		for (
			let gramSize = GRAM_SIZE_UPPER;
			gramSize >= GRAM_SIZE_LOWER;
			--gramSize
		) {
			results = this.__get(value, gramSize);
			if (results) {
				return results;
			}
		}
		return null;
	}

	__get(value: string, gramSize: number) {
		const normalizedValue = value.toLowerCase();
		const matches = {};
		const gramCounts = _gramCounter(normalizedValue, gramSize);
		const items = this.items[gramSize];
		let sumOfSquareGramCounts = 0;
		let gram;
		let gramCount;
		let i;
		let index;
		let otherGramCount;

		for (gram in gramCounts) {
			gramCount = gramCounts[gram];
			sumOfSquareGramCounts += Math.pow(gramCount, 2);
			if (gram in this.matchDict) {
				for (i = 0; i < this.matchDict[gram].length; ++i) {
					index = this.matchDict[gram][i][0];
					otherGramCount = this.matchDict[gram][i][1];
					if (index in matches) {
						matches[index] += gramCount * otherGramCount;
					} else {
						matches[index] = gramCount * otherGramCount;
					}
				}
			}
		}

		const vectorNormal = Math.sqrt(sumOfSquareGramCounts);
		let results = [];
		let matchScore;

		// build a results list of [score, str]
		for (const matchIndex in matches) {
			matchScore = matches[matchIndex];
			results.push([
				matchScore / (vectorNormal * items[matchIndex][0]),
				items[matchIndex][1],
			]);
		}

		results.sort(sortDescending);

		let newResults = [];
		const endIndex = Math.min(50, results.length);
		// truncate somewhat arbitrarily to 50
		for (let i = 0; i < endIndex; ++i) {
			newResults.push([
				_distance(results[i][1], normalizedValue),
				results[i][1],
			]);
		}
		results = newResults;
		results.sort(sortDescending);

		newResults = [];
		for (let i = 0; i < results.length; ++i) {
			if (results[i][0] == results[0][0]) {
				newResults.push([results[i][0], this.exactSet[results[i][1]]]);
			}
		}

		return newResults;
	};
}