<script>
	import { fork } from "svelte";
	import { createAttachmentKey } from "svelte/attachments";

	let style = $state('');
	let attach = $state(undefined);

	let forked;
</script>

<button onclick={()=>{
	forked = fork(()=>{
		style = style ? '' : 'color: red';
		attach = attach ? undefined : (node) => {
			node.setAttribute('data-attached', 'true');
			return () => node.removeAttribute('data-attached');
		};
	})
}}>fork</button>

<button onclick={()=>{
	forked.commit();
}}>commit</button>

<!-- force $.attribute_effect, which uses a block effect -->
<p {...{style}}>foo</p>
<p {...{style, [createAttachmentKey()]: attach}}>foo</p>
<p {@attach attach}>foo</p>
