<script>
	export let name;
</script>

<editor contenteditable="true" bind:innerHTML={name}></editor>
<p>hello {@html name}</p>