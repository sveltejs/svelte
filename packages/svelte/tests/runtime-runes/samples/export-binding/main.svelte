<script>
    import Counter from './counter/index.svelte';
    let increment;
</script>

<Counter bind:increment={increment} />
<button onclick={increment}>increment</button>
