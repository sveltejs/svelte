<script>
    const filesState = $state({ files: {} });
    let nodes = { id: 1, items: [{ id: 2, items: [{ id: 3 }, { id: 4 }] }] };
    filesState.files = nodes;
    function test() {
        $inspect.trace();
        console.log('before assignment');
        filesState.files.items[0].parent = filesState.files;
        console.log('after assignment');
    }
    $effect(test);
</script>