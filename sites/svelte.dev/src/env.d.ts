interface ImageToolsPictureData {
	sources: Record<'avif' | 'webp' | 'png', { src: string; w: number }[]>;
	img: {
		src: string;
		w: number;
		h: number;
	};
}

declare module '*?big-image' {
	const value: ImageToolsPictureData;
	export default value;
}
