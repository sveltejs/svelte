<svelte:window onclick={() => console.log('window')} />
<svelte:document onclick={() => console.log('document')} />
<svelte:body onclick={() => console.log('body')} />

<p>{@html '<p>invalid</p>'}</p>
