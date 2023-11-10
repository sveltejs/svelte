/**
 * @param {any} obj
 * @returns {obj is Date}
 */
export function is_date(obj) {
	return Object.prototype.toString.call(obj) === '[object Date]';
}
