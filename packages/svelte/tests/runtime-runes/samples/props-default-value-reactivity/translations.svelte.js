let greeting = $state('Hello');

export function get_translation() {
	return greeting;
}

export function set_translation(value) {
	greeting = value;
}
