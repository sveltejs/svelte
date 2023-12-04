<script>
  export let name;
</script>

<editor contenteditable="true" bind:innerHTML={name} />
<p>hello {@html name}</p>
