export function link<T extends { next?: T; prev?: T }>(next: T, prev: T) {
	prev.next = next;
	if (next) next.prev = prev;
}
