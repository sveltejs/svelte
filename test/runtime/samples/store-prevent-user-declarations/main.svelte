<script>
	export let count;
	let $count;
</script>

<button on:click="{() => count.update(n => n + 1)}">count {$count}</button>