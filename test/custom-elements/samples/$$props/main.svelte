<svelte:options tag="custom-element"/>

<script>
	export let name;
	export let hyphenatedAttr;
</script>

<p>name: {name}</p>
<p>hyphenated attribute: {hyphenatedAttr}</p>
<p>$$props: {JSON.stringify($$props)}</p>
<p>$$restProps: {JSON.stringify($$restProps)}</p>

