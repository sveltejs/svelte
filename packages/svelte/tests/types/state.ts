import type { ClassValue } from 'svelte/elements';

// Regression test for #17117: this should not trigger deep/infinite type instantiation
const cls = $state.raw<ClassValue[]>([]);
const cls_snap: ReturnType<typeof $state.snapshot<ClassValue[]>> =
	$state.snapshot<ClassValue[]>(cls);

type SnapshotTuple = ReturnType<typeof $state.snapshot<[number, string]>>;

const tuple_ok: SnapshotTuple = [1, 'a'];
tuple_ok[0] === 1;
tuple_ok[1] === 'a';

// @ts-expect-error tuple element type should be preserved
const tuple_wrong: SnapshotTuple = [1, 2];
