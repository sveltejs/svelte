<!-- TODO we need to be able to fetch the data in preload -->

<script context="module">
	export async function preload() {
		const r = await this.fetch('repls.json');

		return {
			list: await r.json()
		};
	}
</script>

<script>
	export let list;
</script>