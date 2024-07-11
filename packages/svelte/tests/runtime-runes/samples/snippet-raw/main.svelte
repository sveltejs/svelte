<script>
	import { createRawSnippet } from 'svelte';

	const hello = createRawSnippet({
		mount() {
			const p = document.createElement('p')
			p.textContent = 'hello world';
			return p;
		},
		render() {
			return '<p>hello world</p>';
		}
	});
</script>

{@render hello()}
