<script lang="ts">
	let { get_id, load } = $props<{
		get_id: () => string | undefined;
		load: (id: string | undefined) => Promise<{ name: string | undefined }>;
	}>();

	const first = $derived(await load(get_id()));
	const second = $derived(await load(get_id()));
</script>

<p>{first.name} {second.name}</p>
