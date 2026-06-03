export class Counter {
	count = -1;
	static count() {}
	constructor() {
		this.count = $state(0);
	}
}
