<script lang="ts">
	class C {
		get() {
			return a;
		}
	}

	const obj: { c?: C } = {};
	obj.c = new C();

	let a = $derived(await Promise.resolve(42));
	// reads `a` via the method of an instance stored in `obj.c`
	let b = $derived(await Promise.resolve(obj.c.get()));
</script>

<p>{a}/{b}</p>
