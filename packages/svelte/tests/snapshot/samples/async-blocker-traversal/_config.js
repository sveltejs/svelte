import { test } from '../../test';

// Exercises blocker analysis / `trace_references` traversal: chained assignments,
// an assignment cycle, functions referencing the same binding repeatedly (the
// shared-`seen` memoization path), returned closures, the `$effect` special case,
// and multiple top-level async groups with different blocker indices.
export default test({ compileOptions: { experimental: { async: true } } });
