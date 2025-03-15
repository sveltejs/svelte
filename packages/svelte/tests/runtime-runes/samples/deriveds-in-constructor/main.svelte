<script>
	class Foo {
		#state = $state('state')
		#derived = $derived('derived ' + this.#state);
		#derivedBy = $derived.by(() => {
			return 'derived.by ' + this.#derived 
		});
		
		initial
		
		constructor() {
			this.initial = [this.#state, this.#derived, this.#derivedBy]
		}
	}
	const foo = new Foo()
</script>

<p>{foo.initial}</p>