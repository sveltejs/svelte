<svelte:options customElement="custom-element" />

<script>
	export let name;
	export let events = [];

	function action(_node, name) {
		events.push(name);
		return {
			update(name) {
				events.push(name);
			},
			destroy() {
				events.push("destroy");
			},
		};
	}
</script>

<div use:action={name}>action</div>
