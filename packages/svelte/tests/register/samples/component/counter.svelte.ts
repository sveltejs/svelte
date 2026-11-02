export class Counter {
	count: number = $state(0);
	double = $derived(this.count * 2);
}
