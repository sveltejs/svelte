export default function add_to_set(a: Set<any>, b: Set<any>) {
	b.forEach(item => {
		a.add(item);
	});
}