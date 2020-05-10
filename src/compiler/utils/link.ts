export const link = <T extends { next?: T; prev?: T }>(next: T, prev: T) =>
	void ((prev.next = next) && (next.prev = prev));
