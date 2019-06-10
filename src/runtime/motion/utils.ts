export function is_date(obj: any): obj is Date {
	return Object.prototype.toString.call(obj) === '[object Date]';
}
