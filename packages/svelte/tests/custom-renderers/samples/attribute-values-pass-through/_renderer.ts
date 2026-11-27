import { create_test_renderer } from '../../renderer.js';

const renderer = create_test_renderer({ cross: false });

export const root = renderer.createFragment();

renderer.embed = () => ({ container: root });

renderer.setAttribute = (element, name, value) => {
	element.attributes[name] = value;
};

export default renderer;
