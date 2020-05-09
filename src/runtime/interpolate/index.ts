export function dates(a, b) {
	const difference = (b = new Date(b).getTime()) - (a = new Date(a).getTime());
	const d = new Date(a);
	return (t) => (d.setTime(a + difference * t), d);
}
export function numbers(a, b) {
	const d = (b = +b) - (a = +a);
	return (t) => a + d * t;
}
