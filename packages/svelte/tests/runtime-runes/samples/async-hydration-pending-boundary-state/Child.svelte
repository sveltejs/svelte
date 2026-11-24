<script lang="ts">
	let { get_id, load } = $props<{
		get_id: () => string | undefined;
		load: (id: string | undefined) => Promise<{ name: string | undefined }>;
	}>();
	const user = $derived(await load(get_id()));
</script>

<p>script: {user.name}</p>
