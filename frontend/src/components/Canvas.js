import { useEffect, useRef } from 'react';

const Canvas = ({ data }) => {
	const canvas = useRef(null);

	const drawCanvas = (canvasCtx, canvas, data) => {
		const WIDTH = canvas.width;
		const HEIGHT = canvas.height;

		canvasCtx.fillStyle = 'rgb(0, 0, 0)';
		canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

		const barWidth = WIDTH / data.length;

		let barHeight;
		let x = 0;

		// console.log('max', Math.max(...data), HEIGHT);

		for (let i = 0; i < data.length; i++) {
			barHeight = (data[i] * HEIGHT) / 2;

			canvasCtx.fillStyle = 'rgb(255,255,255)';
			canvasCtx.fillRect(x, HEIGHT / 2, barWidth, barHeight);

			canvasCtx.fillRect(x, HEIGHT / 2, barWidth, -barHeight);

			x += barWidth;
		}
	};

	useEffect(() => {
		const context = canvas.current.getContext('2d');
		canvas.current.width = canvas.current.offsetWidth;
		canvas.current.height = canvas.current.offsetHeight;
		drawCanvas(context, canvas.current, data);
	});
	return (
		<canvas ref={canvas} style={{ height: '100%', width: '100%' }}></canvas>
	);
};

export default Canvas;
