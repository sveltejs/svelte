// adapted from https://github.com/Glench/fuzzyset.js/blob/master/lib/fuzzyset.js
// BSD Licensed

export default function FuzzySet(
	arr,
	useLevenshtein,
	gramSizeLower,
	gramSizeUpper
) {
	// default options
	arr = arr || [];
	this.gramSizeLower = gramSizeLower || 2;
	this.gramSizeUpper = gramSizeUpper || 3;
	this.useLevenshtein = typeof useLevenshtein !== 'boolean'
		? true
		: useLevenshtein;

	// define all the object functions and attributes
	this.exactSet = {};
	this.matchDict = {};
	this.items = {};

	// helper functions
	function levenshtein(str1, str2) {
		const current = [];
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

	// return an edit distance from 0 to 1
	function _distance(str1, str2) {
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

	const _nonWordRe = /[^\w, ]+/;

	function _iterateGrams(value, gramSize) {
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

	function _gramCounter(value, gramSize) {
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

	// the main functions
	this.get = function(value, defaultValue) {
		// check for value in set, returning defaultValue or null if none found
		const result = this._get(value);
		if (!result && typeof defaultValue !== 'undefined') {
			return defaultValue;
		}
		return result;
	};

	this._get = function(value) {
		const normalizedValue = this._normalizeStr(value);
		const result = this.exactSet[normalizedValue];

		if (result) {
			return [[1, result]];
		}

		let results = [];
		// start with high gram size and if there are no results, go to lower gram sizes
		for (
			let gramSize = this.gramSizeUpper;
			gramSize >= this.gramSizeLower;
			--gramSize
		) {
			results = this.__get(value, gramSize);
			if (results) {
				return results;
			}
		}
		return null;
	};

	this.__get = function(value, gramSize) {
		const normalizedValue = this._normalizeStr(value);
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

		function isEmptyObject(obj) {
			for (const prop in obj) {
				if (obj.hasOwnProperty(prop)) return false;
			}
			return true;
		}

		if (isEmptyObject(matches)) {
			return null;
		}

		const vectorNormal = Math.sqrt(sumOfSquareGramCounts);
		let results = [];
		let matchScore;

		// build a results list of [score, str]
		for (const matchIndex in matches) {
			matchScore = matches[matchIndex];
			results.push([
				matchScore / (vectorNormal * items[matchIndex][0]),
				items[matchIndex][1]
			]);
		}
		function sortDescending(a, b) {
			if (a[0] < b[0]) {
				return 1;
			} else if (a[0] > b[0]) {
				return -1;
			} else {
				return 0;
			}
		}

		results.sort(sortDescending);
		if (this.useLevenshtein) {
			const newResults = [];
			const endIndex = Math.min(50, results.length);
			// truncate somewhat arbitrarily to 50
			for (let i = 0; i < endIndex; ++i) {
				newResults.push([
					_distance(results[i][1], normalizedValue),
					results[i][1]
				]);
			}
			results = newResults;
			results.sort(sortDescending);
		}
		const newResults = [];
		for (let i = 0; i < results.length; ++i) {
			if (results[i][0] == results[0][0]) {
				newResults.push([results[i][0], this.exactSet[results[i][1]]]);
			}
		}
		return newResults;
	};

	this.add = function(value) {
		const normalizedValue = this._normalizeStr(value);
		if (normalizedValue in this.exactSet) {
			return false;
		}

		let i = this.gramSizeLower;
		for (i; i < this.gramSizeUpper + 1; ++i) {
			this._add(value, i);
		}
	};

	this._add = function(value, gramSize) {
		const normalizedValue = this._normalizeStr(value);
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

	this._normalizeStr = function(str) {
		if (Object.prototype.toString.call(str) !== '[object String]')
			throw 'Must use a string as argument to FuzzySet functions';
		return str.toLowerCase();
	};

	// return length of items in set
	this.length = function() {
		let count = 0;
		let prop;

		for (prop in this.exactSet) {
			if (this.exactSet.hasOwnProperty(prop)) {
				count += 1;
			}
		}
		return count;
	};

	// return is set is empty
	this.isEmpty = function() {
		for (const prop in this.exactSet) {
			if (this.exactSet.hasOwnProperty(prop)) {
				return false;
			}
		}
		return true;
	};

	// return list of values loaded into set
	this.values = function() {
		const values = [];

		for (const prop in this.exactSet) {
			if (this.exactSet.hasOwnProperty(prop)) {
				values.push(this.exactSet[prop]);
			}
		}
		return values;
	};

	// initialization
	let i = this.gramSizeLower;
	for (i; i < this.gramSizeUpper + 1; ++i) {
		this.items[i] = [];
	}
	// add all the items to the set
	for (i = 0; i < arr.length; ++i) {
		this.add(arr[i]);
	}

	return this;
}
