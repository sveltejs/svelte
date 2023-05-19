/**
 * @param {any} obj
 * @returns {boolean}
 */
export function is_date(obj) {
	return Object.prototype.toString.call(obj) === '[object Date]';
}
