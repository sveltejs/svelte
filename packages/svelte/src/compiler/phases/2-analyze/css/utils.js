const regex_return_characters = /\r/g;

/**
 * @param {string} str
 * @returns {string}
 */
export function hash(str) {
	str = str.replace(regex_return_characters, '');
	let hash = 5381;
	let i = str.length;

	while (i--) hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
	return (hash >>> 0).toString(36);
}

const UNKNOWN = {};

/**
 * @param {import('estree').Node} node
 * @param {Set<any>} set
 */
function gather_possible_values(node, set) {
	if (node.type === 'Literal') {
		set.add(String(node.value));
	} else if (node.type === 'ConditionalExpression') {
		gather_possible_values(node.consequent, set);
		gather_possible_values(node.alternate, set);
	} else {
		set.add(UNKNOWN);
	}
}

/**
 * @param {import('#compiler').Text | import('#compiler').ExpressionTag} chunk
 * @returns {Set<string> | null}
 */
export function get_possible_values(chunk) {
	const values = new Set();

	if (chunk.type === 'Text') {
		values.add(chunk.data);
	} else {
		gather_possible_values(chunk.expression, values);
	}

	if (values.has(UNKNOWN)) return null;
	return values;
}
