<script>
    export let name;

    let toggle = false;
</script>
<!-- ok -->
<editor contenteditable="true" bind:innerHTML={name}></editor>
<editor contenteditable="" bind:innerHTML={name}></editor>
<editor contenteditable bind:innerHTML={name}></editor>
<!-- error -->
<editor contenteditable={toggle} bind:innerHTML={name}></editor>
