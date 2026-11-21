<script lang="ts">
	let { load }: { load: (name: string, ...dependencies: unknown[]) => Promise<string> } = $props();

	// independent of each other, so they are loaded in parallel
	const a = $derived(await load('a'));
	const b = $derived(await load('b'));

	// `c` reads `b`, so it is loaded once `a` and `b` are done
	const c = $derived(await load('c', b));
	const upper = $derived(c.toUpperCase());

	// a regular `await` doesn't hold up async deriveds that don't depend on it...
	const config = await load('config');

	// ...so `d`, which is independent of everything before it, is loaded right away...
	const d = $derived(await load('d'));

	// ...while `e` reads `config`, so it is loaded once `config` is done
	const e = $derived(await load('e', config));
</script>

<output>{a} {b} {c} {upper} {config} {d} {e}</output>
