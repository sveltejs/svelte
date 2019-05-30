export default function add_to_set<T>(a: Set<T>, b: Set<T> | Array<T>) {
	// @ts-ignore
	b.forEach(item => {
		a.add(item);
	});
}
