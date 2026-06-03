<script>
	class Foo {
		a = $state(0);
		#b = $state();
		foo = $derived({ bar: this.a * 2 });
		bar = $derived({ baz: this.foo });
		constructor() {
			this.a = 1;
			this.#b = 2;
			this.foo.bar = 3;
			this.bar = 4;
		}
	}
</script>
