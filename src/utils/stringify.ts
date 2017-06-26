export default function stringify(data: string) {
	return JSON.stringify(data.replace(/([^\\])?([@#])/g, '$1\\$2'));
}
