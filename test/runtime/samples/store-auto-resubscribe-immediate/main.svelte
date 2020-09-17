<script>
	import { writable } from '../../../../store';

	let value = writable({ foo: 1, bar: 2 });
	$value.foo = $value.foo + $value.bar; // 3
	$value.bar = $value.foo * $value.bar; // 6

	// should resubscribe immediately
	value = writable({ foo: $value.foo + 2, bar: $value.bar - 2 }); // { foo: 5, bar: 4 }
	
	$value.baz = $value.foo + $value.bar; // { foo: 5, bar: 4, baz: 9 }
	
	// should resubscribe immediately
	value = writable({ qux: $value.baz - $value.foo }); // { qux: 4 }

	// should update the store immediately
	$value = { baz: $value.qux }; // { baz: 4 }

	value.update(val => ({ answer: val.baz })); // { answer: 4 }
	value = value; // for ssr
</script>

{JSON.stringify($value)}