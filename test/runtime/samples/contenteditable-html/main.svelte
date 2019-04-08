<script>
    export let name;
</script>

<editor contenteditable="true" bind:html={name}></editor>
<p>hello {@html name}</p>