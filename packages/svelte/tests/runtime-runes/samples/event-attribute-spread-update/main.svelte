<script>
	let delegated = $state(0);
	let non_delegated = $state(0);
	let attrs = $state({
		onclick: () => {
			delegated += 1;
		},
		onclickcapture: () => {
			non_delegated += 1;
		}
	});
</script>

<button
	onclick={() =>
		(attrs = {
			onclick: () => {
				delegated += 2;
			},
			onclickcapture: () => {
				non_delegated += 2;
			}
		})}
>
	change handlers
</button>
<button onclick={() => (attrs = { onclick: attrs.onclick, onclickcapture: undefined })}>
	remove capture handler
</button>
<button {...attrs}>{delegated} / {non_delegated}</button>
