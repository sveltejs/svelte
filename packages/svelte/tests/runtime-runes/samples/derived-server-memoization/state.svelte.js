let s = $state(0);
let d = $derived.by(() => {
	count += 1;
	return s * 2;
});

export let count = 0;

export function reset() {
	count = 0;
	s = 0;
}

export function increment() {
	s += 1;
}

export function get() {
	return d;
}
