// An instance of the test renderer that defines neither `embed` nor `host`,
// and therefore cannot be combined with other renderers
import { create_test_renderer } from './renderer.js';

export default create_test_renderer({ cross: false });
