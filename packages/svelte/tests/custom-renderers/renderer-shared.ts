// An instance of the test renderer whose components all render into one shared container
// when they're used inside the DOM, like several scenes drawn into the same canvas
import { connections, create_test_renderer } from './renderer.js';

const renderer = create_test_renderer({ cross: false });

export const scene = renderer.createFragment();

renderer.embed = ({ host }) => {
	if (host !== null) throw new Error('the shared renderer can only be used inside the DOM');

	connections.open += 1;
	return { container: scene, destroy: () => void (connections.open -= 1) };
};

export default renderer;
