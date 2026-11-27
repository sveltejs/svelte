<svelte:options customRenderer="../../_renderer.ts" />

<script lang="ts">
	const steps = [true, false, 0, '', 'hello', null, true, undefined];
	let step = $state(0);
	let v = $derived(steps[step]);
</script>

<toggle checked={v} />
<option selected={v} />
<field value={v} />
<field defaultValue={v} />
<toggle defaultChecked={v} />
<spread {...{ checked: v, selected: v, value: v, defaultValue: v, defaultChecked: v }} />
<svelte:element this={'dynamic'} checked={v} selected={v} value={v} defaultValue={v} defaultChecked={v} />

<button onclick={() => step++}>next</button>
