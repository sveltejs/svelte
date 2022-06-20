<script>
import { onMount, onDestroy, tick } from 'svelte';

export let component;

let frame;
let doc;
let content;

$: mountComponent(doc, component);
$: updateProps($$props);

function mountComponent(doc) {
  if (content) content.$destroy();
  if (doc && component) {
    const { component, ...props } = $$props;
    content = new component({ target: doc.body, props });
  }
}

function updateProps(props) {
  if (content) {
    const { component, ...rest } = props;
    content.$set(rest);
  }
}

function loadHandler() {
  doc = frame.contentDocument;
  // import styles
  Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
    .forEach(node => doc.head.appendChild(node.cloneNode(true)));
}

onMount(async () => {
  await tick();
  if (frame.contentDocument.readyState === 'complete' && frame.contentDocument.defaultView) {
    loadHandler();
  } else {
    frame.addEventListener('load', loadHandler);
  }
});

onDestroy(() => {
  if (frame) frame.removeEventListener('load', loadHandler);
  if (content) content.$destroy();
});
</script>

<iframe bind:this={frame} title="frame"></iframe>

<style>
iframe {
  border: none;
  width: 100%;
  height: 100%;
}
</style>
