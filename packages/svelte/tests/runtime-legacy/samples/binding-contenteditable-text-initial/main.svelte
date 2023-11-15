<script>
	export let name;
</script>

<editor contenteditable="true" bind:textContent={name}>
	<b>world</b>
</editor>
<p>hello {name}</p>