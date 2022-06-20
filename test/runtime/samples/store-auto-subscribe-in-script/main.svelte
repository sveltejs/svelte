<script>
	export let count;

	export function get_count() {
		return $count;
	}
</script>

<button on:click="{() => count.update(n => n + 1)}">+1</button>