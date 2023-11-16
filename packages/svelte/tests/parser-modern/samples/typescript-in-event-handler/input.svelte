<script lang="ts">
	let count = $state(0);
</script>

<button
	on:click={(e: MouseEvent) => {
		const next: number = count + 1;
		count = next;
	}}
>clicks: {count}</button>
