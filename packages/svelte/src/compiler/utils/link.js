/**
 * @template {{ next?: T; prev?: T }} T
 * @param {T} next
 * @param {T} prev
 */
export function link(next, prev) {
	prev.next = next;
	if (next) next.prev = prev;
}
