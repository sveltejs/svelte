<script module>
	const { length: module_length } = 'module';
</script>

<script>
	const [a, b] = 'xy';
	const { length } = 'hello';
	let [first, ...rest] = `abc`;
	var { missing = 'fallback' } = 42;
	const { length: indirect_length } = String('indirect');
	let { length: state_length } = $state('state');
	const { length: derived_length } = $derived('derived');
</script>

<p>{a}{b} {length}</p>
<p title={length}>{first} {rest.join('')} {missing} {indirect_length}</p>
<p>{module_length} {state_length} {derived_length}</p>
{#if true}
	{@const { length: const_length } = 'const'}
	<p>{const_length}</p>
{/if}
