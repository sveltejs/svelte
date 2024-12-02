<script lang="ts">
	let el = $state({ foo: 'foo', bar: 'bar' });
	function fn(el) {
		console.log('invoked')
		return el;
	}
</script>

{#snippet foo(a)}
	{a.foo} {a.bar}
{/snippet}

{@render foo(fn(el))}
