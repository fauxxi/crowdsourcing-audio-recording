import { useEffect, useRef } from 'react';

const Visualize = ({ draw }) => {
	const canvas = useRef(null);

	useEffect(() => {
		const canvasCtx = canvas.current.getContext('2d');
		canvas.current.width = canvas.current.offsetWidth;
		canvas.current.height = canvas.current.offsetHeight;
		draw(canvasCtx, canvas.current);
	});
	return (
		<canvas ref={canvas} style={{ height: '100%', width: '100%' }}></canvas>
	);
};

export default Visualize;
