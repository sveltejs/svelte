import { test } from '../../test';

// the `bind:` retry loop renders into a copy, and the copy must report the same
// tree position it will have after `subsume`, or this title loses to `A`
export default test({});
