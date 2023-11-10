<script lang="ts">import { onMount } from 'svelte';
let count = 0;
onMount(() => {
    const id = setInterval(() => count++, 1000);
    const clear = () => clearInterval(id);
    return clear;
});
</script>

<h1>Hello world!</h1>
<div>Counter value: {count}</div>
