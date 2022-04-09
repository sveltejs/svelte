<script>
    import { setContext } from 'svelte';
    let a = {};
    let b = setContext('foo', a);
</script>

<div>{a === b}</div>
