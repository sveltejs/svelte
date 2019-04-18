<script>
    export let name;

    let toggle = false;
</script>
<editor contenteditable={toggle} bind:html={name}></editor>
