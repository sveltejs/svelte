<script module lang="ts">
	export const functions = [() => 'hello', () => 'goodbye'];
</script>

<script lang="ts">
	let { ...rest } = $props();
	let step = $state(0);
	let fn = $derived([functions[0], functions[1], undefined, functions[0]][step]);
	let spread = $derived(fn ? { fn, onclick: fn } : {});
</script>

<thing fn={fn} />
<thing {...rest} fn={fn} />
<thing {...spread} />
<svelte:element this="native-thing" {...rest} fn={fn} />
<button onclick={() => step++}>next</button>
