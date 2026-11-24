<script>
	let foo = $state();
	let value = $state();
	let group = $state();
	let width = $state();
	let el;
</script>

<!-- arbitrary properties, including names of built-in bindings that aren't valid on this element -->
<my-element bind:foo bind:value bind:group={() => group, (v) => (group = v)}></my-element>

<!-- built-in bindings that are valid on all elements keep working -->
<my-element bind:this={el} bind:clientWidth={width}></my-element>
