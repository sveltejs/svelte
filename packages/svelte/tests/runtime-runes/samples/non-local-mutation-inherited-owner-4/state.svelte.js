class Global {
	state = $state({});

	add_a(a) {
		this.state.a = a;
	}

	increment_a_b() {
		this.state.a.b++;
	}
}

export const global = new Global();
