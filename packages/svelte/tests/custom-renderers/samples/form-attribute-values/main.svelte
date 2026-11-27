<svelte:options customRenderer="../../_renderer.ts" />

<script lang="ts">
	const values = [true, false, null, true, undefined, 0, '', 'truthy'];
	let index = $state(0);
	let value = $derived(values[index]);
</script>

<toggle checked={value} />
<option selected={value} />
<field {value} />
<defaults value="fixed" checked defaultValue={value} defaultChecked={value} />
<spread {...{ checked: value, selected: value, value, defaultValue: value, defaultChecked: value }} />
<svelte:element this={'dynamic'} checked={value} selected={value} {value} defaultValue={value} defaultChecked={value} />
<button onclick={() => index++}>update</button>
