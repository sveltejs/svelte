export default function proxy(object) {
	return $state(object);
}
export function createCounter() {
	let count = $state(0);
	count++;
}
export const proxy_in_arrow = (object) => $state(object);
