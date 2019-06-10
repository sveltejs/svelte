<script>
	export let name;
</script>

<editor contenteditable="true" bind:html={name}>
	<b>world</b>
</editor>
<p>hello {@html name}</p>