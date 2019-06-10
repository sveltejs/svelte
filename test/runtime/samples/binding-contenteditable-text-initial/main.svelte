<script>
	export let name;
</script>

<editor contenteditable="true" bind:text={name}>
	<b>world</b>
</editor>
<p>hello {name}</p>