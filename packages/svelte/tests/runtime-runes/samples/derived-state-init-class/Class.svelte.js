export class Test {
	local_arr;
	constructor(arr) {
		this.local_arr = $derived($state(arr()));
	}
}
