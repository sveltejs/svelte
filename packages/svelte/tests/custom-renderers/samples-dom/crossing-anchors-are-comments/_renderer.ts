import { create_test_renderer, type ObjFragment } from '../../renderer.js';

const renderer = create_test_renderer({ cross: false });

/** The containers content using this renderer was rendered into */
export const containers: ObjFragment[] = [];

// returns no `node`, so the runtime creates the node that represents the content in the host tree
renderer.embed = () => {
	const container = renderer.createFragment();
	containers.push(container);
	return { container };
};

export default renderer;
