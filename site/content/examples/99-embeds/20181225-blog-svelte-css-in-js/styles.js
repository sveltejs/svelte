import emotion from '@emotion/css@11.1.3/dist/emotion-css.umd.min.js';

const { css } = emotion;

const brand = '#74D900';

export const title = css`
	color: ${brand};
	font-size: 1em;
	white-space: nowrap;
`;

export const comicSans = css`
	font-family: 'Comic Sans MS', cursive;
`;

export const box = css`
	position: relative;
	display: inline-block;
	border: 2px solid ${brand};
	line-height: 1;
	padding: 4px;
	border-radius: 4px;
`;

export const link = css`
	color: inherit;
	font-weight: bold;
	text-decoration: none;
	border-bottom: 1px solid ${brand};
	&:hover {
		text-decoration: none;
		background: ${brand};
	}
`;
