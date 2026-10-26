<svelte:options runes={false} />

<script>
	export let unchanged;
	let value = '';
	let number = 0;
	let text = '';
	let checked = false;
	let unchecked = true;
	let group = 1;
	let check_group = ['a'];
	const noop = () => {};
</script>

<section>
	<input class="text" use:noop bind:value />
	<input type="number" use:noop bind:value={number} />
	<textarea use:noop bind:value={text}></textarea>
	<input class="check" type="checkbox" use:noop bind:checked />
	<input class="uncheck" type="checkbox" use:noop bind:checked={unchecked} />
	<input type="radio" value={1} use:noop bind:group />
	<input type="radio" value={2} use:noop bind:group />
	<input type="checkbox" value="a" use:noop bind:group={check_group} />
	<input type="checkbox" value="b" use:noop bind:group={check_group} />
	<input class="unchanged" use:noop bind:value={unchanged} />
	<p>{JSON.stringify([value, number, text, checked, unchecked, group, check_group, unchanged])}</p>
	<button onclick={() => { value = 'updated'; group = 1; check_group = ['a']; }}>update</button>
</section>
