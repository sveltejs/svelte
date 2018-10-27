export default function addToSet(a: Set<any>, b: Set<any>) {
	b.forEach(item => {
		a.add(item);
	});
}