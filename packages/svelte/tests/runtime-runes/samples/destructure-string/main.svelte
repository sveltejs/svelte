<script>
	let [first, last] = $state('JD');
	let [static_first, static_last] = $state('JD');
	const [plain_first] = 'JD';
	let { length } = $state('JD');
	let name = $state('JD');
	let [derived_first, derived_last] = $derived(name);
	let [head, ...rest] = $derived(name);
</script>

<button onclick={() => {
	name = '𝟘𝟙𝟚';
	[first, last] = name;
}}>update</button>

<p>{static_first}.{static_last}.</p>
<p>{plain_first}: {length}</p>
<p>{first}.{last}.</p>
<p>{derived_first}.{derived_last}.</p>
<p>{head}: {rest.join(',')}</p>
