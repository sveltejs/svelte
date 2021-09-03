<script>
  import { createEventDispatcher } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { Icon } from '@sveltejs/site-kit';

  import setClipboard from '../../../_utils/setClipboard'

  const dispatch = createEventDispatcher();

  export let name;
  export let gist;
  export let version;

  const REPL_BUTTON_URL = `${window.location.origin}/svelte-share-repl.svg`

  let linkCopied = false

  $: canShare = gist?.uid && version;

	function getForkedReplUrl() {
		return `${window.location.origin}/repl/${gist.uid}?version=${version}`
	}

  function copyLink() {
    linkCopied = true;
    setClipboard(getForkedReplUrl());

    setTimeout(() => {
      dispatch('close')
    }, 500);
  }
</script>

<div class="share-panel" transition:fly="{{ y: -5, duration: 500 }}">
  {#if canShare}
    <h4>Share REPL Button</h4>
    <img src="/svelte-share-repl.svg" alt="share REPL icon" width="150" />
    <h5>Markdown</h5>
    <textarea name="markdown" rows="2" readonly>[![Edit {name}]({REPL_BUTTON_URL})]({getForkedReplUrl()})</textarea>
    <h5>HTML</h5>
    <textarea name="html" rows="2" readonly><a href="{getForkedReplUrl()}"><img alt="Edit {name}" src="{REPL_BUTTON_URL}"></a></textarea>

    <hr>

    <div class="actions">
      <button class="cancel" on:click={() => dispatch('close')}>Cancel</button>
      <button 
        class="copy-link" 
        class:click={linkCopied}
        on:click={copyLink}
      >
        <span>Copy REPL link</span>
        {#if linkCopied}
          <div transition:fade="{{ duration: 200 }}">
           <Icon  name="check" />
          </div>
        {/if}
      </button>
    </div>

  {:else}
     <p>You need to save the REPL to share it!</p>
  {/if}
  </div>

<style>
  p {
    color: #333;
    margin: 0;
  }

  .share-panel {
    position: absolute;
    left: 0;
    top: 150%;
    min-width: 300px;
    padding: 1em;
    text-align: left;
    border: 1px solid #eee;
    border-radius: var(--border-r);
    background-color: var(--back);
    transform: translateX(-50%);
    z-index: 1;
  }

  textarea {
    resize: none;
    width: 100%;
    padding: .3em;
    font-family: var(--font);
    line-height: 1.3em;
    white-space: nowrap;
  }

  h5, hr {
    margin-top: .5em;
  }

  hr {
    display: block;
    height: 1px;
    border: 0; 
    border-top: 1px solid #eee;
    margin-bottom: .5em;
  }

  .actions {
    display: flex;
    justify-content: flex-end;
  }

  button {
    color: var(--heading);
    font-size: .8em;
    padding: .3em;
    border: 1px solid #eee;
    border-radius: var(--border-r);
  }

  .cancel {
    background-color: var(--back-light);
  }

  .copy-link {
    position: relative;
    color: var(--prime);
    border-color: var(--prime);
    margin-left: .5em;
  }

  .copy-link.click span {
    color: transparent;
  }

  .copy-link :global(.icon) {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%)
  }
</style>