<script>
	let { inc, count = $bindable() } = $props();
</script>

<button onclick={inc}>{count.a} (ok)</button>
<button onclick={() => count.a++}>{count.a} (bad)</button>
