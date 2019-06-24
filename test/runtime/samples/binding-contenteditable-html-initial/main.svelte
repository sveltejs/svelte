<script>
	export let name;
</script>

<editor contenteditable="true" bind:innerHTML={name}>
	<b>world</b>
</editor>
<p>hello {@html name}</p>