<script>
    import Counter from './Counter.svelte';
    let increment;
</script>

<Counter bind:increment={increment} />
<button onclick={increment}>increment</button>