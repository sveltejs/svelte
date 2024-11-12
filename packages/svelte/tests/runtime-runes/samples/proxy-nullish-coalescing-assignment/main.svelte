<script>
	let items = $state(null);

	class Foo {
		#items = $state(null);

		get items() {
			return this.#items;
		}

		add() {
			(this.#items ??= []).push(this.#items.length);
		}
	}

	const foo = new Foo();
</script>

<button onclick={() => (items ??= []).push(items.length)}>
	items: {JSON.stringify(items)}
</button>

<button onclick={() => foo.add()}>
	items: {JSON.stringify(foo.items)}
</button>
