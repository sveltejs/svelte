export function is_date(obj: any) {
	return Object.prototype.toString.call(obj) === '[object Date]';
}
