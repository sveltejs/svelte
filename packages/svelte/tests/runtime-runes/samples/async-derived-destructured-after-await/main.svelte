<script lang="ts">
	async function getUser() {
		return {
			id: 1,
			name: 'Rich'
		};
	}

	const user = $derived(await getUser());
	const { id, name } = $derived(user);
</script>

{id}-{name}
