import { useEffect, useRef } from 'react';

const Waveform = ({ waveform }) => {
	const canvas = useRef(null);

	useEffect(() => {
		console.log('ctx', canvas.current.getContext('2d'));
		console.log('waveform', waveform);
		const scaleY = (amplitude, height) => {
			const range = 256;
			const offset = 128;

			return height - ((amplitude + offset) * height) / range;
		};

		const ctx = canvas.current.getContext('2d');
		ctx.beginPath();

		// Loop forwards, drawing the upper half of the waveform
		for (let x = 0; x < waveform.length; x++) {
			const val = waveform[x] * 4000;
			console.log('val', val);

			ctx.lineTo(x, val);
		}

		// Loop backwards, drawing the lower half of the waveform
		// for (let x = waveform.length - 1; x >= 0; x--) {
		// 	const val = channel.min_sample(x);

		// 	ctx.lineTo(x + 0.5, scaleY(val, canvas.height) + 0.5);
		// }

		ctx.closePath();
		ctx.stroke();
		ctx.fill();
	}, []);

	return (
		<div>
			<canvas ref={canvas} width='700' height='250'></canvas>
		</div>
	);
};

export default Waveform;
