<script lang="ts">
	let { a }: { a: string } = $state({});
	let { b }: { b: string } = $derived(a);
</script>

<button onclick={()=>a++}></button>