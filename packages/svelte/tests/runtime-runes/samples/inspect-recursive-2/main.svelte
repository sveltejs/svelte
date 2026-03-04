<script>
	class A {
		constructor() {
			this.a = this;
		}
	}
	const state = $state(new A());
	$inspect(state);

	class B {
		constructor() {
			this.a = { b: this };
		}
	}
	const state2 = $state(new B());
	$inspect(state2);
</script>
