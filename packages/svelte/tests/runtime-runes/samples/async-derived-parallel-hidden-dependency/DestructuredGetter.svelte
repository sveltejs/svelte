<script lang="ts">
	let client: { id: number } | undefined;

	const services = {
		get client() {
			client ??= { id: 42 };
			return client;
		}
	};

	await Promise.resolve();

	// destructuring runs the getter, which initializes `client`
	const { client: api } = services;

	const result = $derived(await Promise.resolve(client?.id));
</script>

<output>{result}/{api.id}</output>
