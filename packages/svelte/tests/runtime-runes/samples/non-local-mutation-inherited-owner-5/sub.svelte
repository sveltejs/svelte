<script>
	let { inc } = $props();
	let { count } = $props.bindable();
</script>

<button onclick={inc}>{count.a} (ok)</button>
<button onclick={() => count.a++}>{count.a} (bad)</button>
