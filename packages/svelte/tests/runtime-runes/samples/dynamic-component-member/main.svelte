<script>
	import Icon from './Icon.svelte';

	let icons = $state({ currency: { Icon } });
	const platformIcons = $derived(icons);
</script>

<platformIcons.currency.Icon />
