let count = $state(0);

export function get() {
	return count;
}

export function set() {
	count++;
}
