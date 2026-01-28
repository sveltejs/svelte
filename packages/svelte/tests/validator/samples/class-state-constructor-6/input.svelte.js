export class Counter {
	count = $state(0);
	constructor() {
		this['count'] = $state(0);
	}
}
