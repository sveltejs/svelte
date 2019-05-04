export function new_tail(): string {
	return '%%tail_head%%';
}

export function attach_head(head: string, tail: string): string {
	return tail.replace('%%tail_head%%', head);
}
