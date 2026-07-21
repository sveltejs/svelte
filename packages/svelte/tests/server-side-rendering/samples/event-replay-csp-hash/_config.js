import { test } from '../../test';

// under `csp.hash`: no inline `onload` attrs, head script + hash returned, and
// the script lands BEFORE user `<svelte:head>` content (otherwise a cached
// preload could fire its `load` event before the listener attaches)

export default test({
	csp: { hash: true },
	script_hashes: ['sha256-VyPjBqafUNeHE2rLgLKQN7xM97MwGeuS77U6ASqjaYY=']
});
