<script>
	import Legacy from './Legacy.svelte';

	let { unchanged = $bindable() } = $props();
	let value = $state('');
	let number = $state(0);
	let text = $state('');
	let checked = $state(false);
	let unchecked = $state(true);
	let group = $state(1);
	let check_group = $state(['a']);
	const noop = () => {};
</script>

<section>
	<input class="text" bind:value use:noop />
	<input type="number" bind:value={number} use:noop />
	<textarea bind:value={text} use:noop></textarea>
	<input class="check" type="checkbox" bind:checked use:noop />
	<input class="uncheck" type="checkbox" bind:checked={unchecked} use:noop />
	<input type="radio" value={1} bind:group use:noop />
	<input type="radio" value={2} bind:group use:noop />
	<input type="checkbox" value="a" bind:group={check_group} use:noop />
	<input type="checkbox" value="b" bind:group={check_group} use:noop />
	<input class="unchanged" bind:value={unchanged} use:noop />
	<p>{JSON.stringify([value, number, text, checked, unchecked, group, check_group, unchanged])}</p>
	<button onclick={() => { value = 'updated'; group = 1; check_group = ['a']; }}>update</button>
</section>
<Legacy {unchanged} />
