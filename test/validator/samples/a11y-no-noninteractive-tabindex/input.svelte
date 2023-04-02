<!-- valid -->
<button />
<button tabindex='0' />
<button tabindex='{0}' />
<div />
<div tabindex='-1' />
<div role='button' tabindex='0' />
<div role='article' tabindex='-1' />
<article tabindex='-1' />
<div role="tabpanel" tabindex='0' />
<svelte:element this={Math.random() ? 'button' : 'div'} tabindex="0" />
<!-- invalid -->
<div tabindex='0' />
<div role='article' tabindex='0' />
<article tabindex='0' />
<article tabindex='{0}' />
