<script>
	import Replace from './Replace.svelte';

	const disabled = { disabled: true };
	const hidden = { hidden: true };
</script>

<button {...disabled}>early</button>
<div {...hidden}>early</div>
<Replace />
<button {...disabled}>late</button>
<div {...hidden}>late</div>
<button {...disabled}>own</button>
