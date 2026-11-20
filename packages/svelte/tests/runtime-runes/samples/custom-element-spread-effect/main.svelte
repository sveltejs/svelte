<script module>
	import { mount, unmount } from 'svelte';
	import Child from './Child.svelte';

	if (!customElements.get('spread-host')) {
		customElements.define('spread-host', class extends HTMLElement {
			set config(value) {
				this.child ??= mount(Child, { target: this });
			}

			disconnectedCallback() {
				if (this.child) unmount(this.child);
			}
		});
	}
</script>

<script>
	let title = $state('a');
</script>

<spread-host {...{ config: {}, title }}></spread-host>
<button onclick={() => (title += 'a')}>change title</button>
