export const log_a = () => {
	console.log('a');
};

export const log_b = () => {
	console.log('b');
};

let handle = $state(log_a);

export const handler = {
	get value() {
		return handle;
	},
	set value(v) {
		handle = v;
	}
};
