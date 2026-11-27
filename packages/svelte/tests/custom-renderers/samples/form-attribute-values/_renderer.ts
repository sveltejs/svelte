import { create_test_renderer } from '../../renderer.js';

const renderer = create_test_renderer({ cross: false });
export const container = renderer.createFragment();

renderer.embed = () => ({ container });

// Unlike the shared HTML-like renderer, retain the values received by the hooks.
renderer.setAttribute = (element, name, value) => {
	element.attributes[name] = value;
};

export default renderer;
