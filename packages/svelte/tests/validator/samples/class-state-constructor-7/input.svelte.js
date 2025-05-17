const count = 'count';

export class Counter {
	constructor() {
		this[count] = $state(0);
	}
}
