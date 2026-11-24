// A second, independent instance of the test renderer, for testing
// content that crosses between two different custom renderers
import { create_test_renderer } from './renderer.js';

export default create_test_renderer({ cross: true });
