 <script>
	import Test from './Test.svelte';

	let entries = $state([]);
	let object = $state({ items: null, group: [] });
	let elementFunBind = $state();
</script>

<button onclick={() => (object.items ??= []).push(object.items.length)}>
	items: {JSON.stringify(object.items)}
</button>

<!-- these should not emit warnings -->
<div bind:this={entries[0]}>x</div>
<input type="checkbox" value=1 bind:group={object.group}>
<input type="checkbox" value=2 bind:group={object.group}>

<Test bind:this={entries[1]}></Test>
<Test bind:this={() => entries[2], (v) => (entries[2] = v)}></Test>
<Test bind:x={entries[3]}></Test>

{#snippet funBind(context)}
	<input bind:this={() => {}, (e) => (context.element = e)} />
{/snippet}
{@render funBind({ set element(e) { elementFunBind = e } })}
