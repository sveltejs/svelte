<script>
	import { mount } from 'svelte';
	import { createAttachmentKey } from 'svelte/attachments';
	import Child from './Child.svelte';

	const mount_child = (target) => mount(Child, { target, props: { target } });
	let title = $state('a');
	let visible = $state(true);
	const registry = $state([]);
	const classes = $state({ active: false });
	const tracking = () => $effect.tracking();
	const attachments = { [createAttachmentKey()]: attachment };

	function attachment(node) {
		let cleanups = 0;
		$effect(() => {
			node.dataset.title = title;
			return () => {
				delete node.dataset.title;
				node.dataset.attachmentCleanups = String(++cleanups);
			};
		});
	}
</script>

{#if visible}
<spread-context
	{...{ options: { registry, tracking, mount: mount_child }, title, class: classes, style: title === 'a' ? 'color: red' : null, 'data-value': title === 'a' ? title : null }}
	{...attachments}
></spread-context>
<svelte:element
	this={'spread-context'}
	{...{ options: { registry, tracking, mount: mount_child }, title, class: classes }}
></svelte:element>
<!-- svelte-ignore attribute_avoid_is -->
<div is="spread-builtin" {...{ options: { registry, tracking, mount: mount_child }, title }}></div>
<spread-context options={{ registry, tracking, mount: mount_child }} {title}></spread-context>
{/if}

<button onclick={() => (title += 'a')}>title</button>
<button onclick={() => (classes.active = !classes.active)}>class</button>
<button onclick={() => registry.push(null)}>register</button>
<button onclick={() => (visible = false)}>remove</button>
<p>{registry.length}</p>
