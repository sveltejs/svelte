export default function findBlock ( fragment ) {
	while ( fragment.type !== 'block' ) fragment = fragment.parent;
	return fragment;
}