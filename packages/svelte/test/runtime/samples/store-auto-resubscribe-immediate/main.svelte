<script>
	import { writable } from 'svelte/store';

	let value = writable({ foo: 1, bar: 2 });
	$value.foo = $value.foo + $value.bar; // 3
	$value.bar = $value.foo * $value.bar; // 6

	// should resubscribe immediately
	value = writable({ foo: $value.foo + 2, bar: $value.bar - 2 }); // { foo: 5, bar: 4 }

	// should mutate the store value
	$value.baz = $value.foo + $value.bar; // { foo: 5, bar: 4, baz: 9 }

	// should resubscribe immediately
	value = writable({ qux: $value.baz - $value.foo }); // { qux: 4 }

	// making sure instrumentation returns the expression value
	$value = {
		one: writable(
			$value = {
				two: ({ $value } = { $value: { fred: $value.qux } }) // { fred: 4 }
			} // { two: { $value: { fred: 4 } } }
		) // { one: { two: { $value: { fred: 4 } } } }
	};

	const one = $value.one;

	value.update(val => ({ answer: $one.two.$value.fred })); // { answer: 4 }
</script>

{JSON.stringify($value)}
