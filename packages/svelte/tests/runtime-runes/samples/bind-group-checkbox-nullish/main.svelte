<script lang="ts">
	let selected: string[] | undefined = $state();
</script>

<input type="checkbox" bind:group={selected} value="a" />
<input type="checkbox" bind:group={selected} value="b" />
<output>{selected?.join(',')}</output>
