import Text from '../../nodes/Text';
import emojiRegex from 'emoji-regex';

export default function validateA11y(text: Text) {
	if (text.parent.type === 'Fragment') {
    accessible_emoji(text);
	}
}

function accessible_emoji(text: Text) {
	if (emojiRegex().test(text.data)) {
		text.component.warn(text, {
			code: `a11y-accessible-emoji`,
			message: `A11y: Emojis should be wrapped in <span>, have role="img", and have an accessible description with aria-label or aria-labelledby.`,
		});
	}
}
