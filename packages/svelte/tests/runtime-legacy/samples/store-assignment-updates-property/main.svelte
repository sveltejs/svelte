<script>
	import { writable } from 'svelte/store';

	const a = writable({ foo: 1, bar: 2 });
	$a.foo = 3;

	const b = writable({ foo: 1, bar: 2 });
	$b = { foo: 3 };

	function update() {
		$a.foo = $a.foo + 1;
		$b = { foo: $b.foo + 1, qux: 0 };
	}
</script>

<p>a: {JSON.stringify($a)}</p>
<p>b: {JSON.stringify($b)}</p>

<button on:click={() => {
	$a.foo = $a.foo + 1;
	$b = { foo: $b.foo + 1, baz: 0 };
}} />

<button on:click={update}></button>
