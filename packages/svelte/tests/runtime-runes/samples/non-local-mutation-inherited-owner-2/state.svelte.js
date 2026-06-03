export function create_my_state() {
	const my_state = $state({
		a: 0
	});

	function inc() {
		my_state.a++;
	}

	return {
		my_state,
		inc
	};
}
