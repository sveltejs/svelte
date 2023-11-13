import { merge } from '../../visitors.js';
import { validate_a11y } from './validate-a11y.js';
import { validate_legacy } from './validate-legacy.js';
import { validate_runes } from './validate-runes.js';
import { validate_template } from './validate-template.js';

export const validation_legacy = merge(validate_template, validate_a11y, validate_legacy);

export const validation_runes = merge(validate_template, validate_a11y, validate_runes);
