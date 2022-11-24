import { useEffect, useState } from 'react';
import { customAlphabet } from 'nanoid';
import Introduction from '../components/Introduction';
import Preparation from '../components/Preparation';
import Recorder from '../components/Recorder';
import { useStore } from '../utils/useStore';

function useWindowSize() {
	// Initialize state with undefined width/height so server and client renders match
	// Learn more here: https://joshwcomeau.com/react/the-perils-of-rehydration/
	const [windowSize, setWindowSize] = useState({
		width: undefined,
		height: undefined,
	});

	useEffect(() => {
		// only execute all the code below in client side
		if (typeof window !== 'undefined') {
			// Handler to call on window resize
			function handleResize() {
				// Set window width/height to state
				setWindowSize({
					width: window.innerWidth,
					height: window.innerHeight,
				});
			}

			// Add event listener
			window.addEventListener('resize', handleResize);

			// Call handler right away so state gets updated with initial window size
			handleResize();

			// Remove event listener on cleanup
			return () => window.removeEventListener('resize', handleResize);
		}
	}, []); // Empty array ensures that effect is only run on mount
	return windowSize;
}

function Main() {
	const stage = useStore((state) => state.stage);
	const id = useStore((state) => state.id);
	const setId = useStore((state) => state.setId);

	const [view, setview] = useState(stage);

	const [length, setlength] = useState(0);
	const sliceVolLevel = useStore((state) => state.sliceVolHistory);

	const size = useWindowSize();

	useEffect(() => {
		if (id === '') {
			const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 5);
			setId(nanoid());
		}
	}, [id]);

	useEffect(() => {
		setlength(Math.floor(size.width / 4));
	}, [size]);

	useEffect(() => {
		sliceVolLevel(length);
	}, [length]);

	return (
		<div className='min-h-screen bg-blue-50 py-10'>
			<header className='container px-4 mx-auto py-5 flex justify-between items-center gap-5 bg-white rounded-lg shadow-md'>
				<div
					className='flex items-center gap-3 cursor-pointer'
					onClick={() => {
						setview(0);
					}}
				>
					<div
						className={`w-10 h-10 flex justify-center items-center rounded-full ${
							stage === 0 || stage === 1 || stage === 2
								? 'bg-blue-600 text-white'
								: 'bg-gray-200 text-gray-500'
						}`}
					>
						1
					</div>
					<div>Introduction</div>
				</div>
				<div
					className={`w-full h-[1px] ${
						stage === 1 || stage === 2 ? 'bg-blue-400' : 'bg-gray-200'
					}`}
				></div>
				<div
					className='flex items-center gap-3 cursor-pointer'
					onClick={() => {
						setview(1);
					}}
				>
					<div
						className={`w-10 h-10 flex justify-center items-center rounded-full ${
							stage === 1 || stage === 2
								? 'bg-blue-600 text-white'
								: 'bg-gray-200 text-gray-500'
						}`}
					>
						2
					</div>
					<div>Qualification</div>
				</div>
				<div
					className={`w-full h-[1px] ${
						stage === 2 ? 'bg-blue-400' : 'bg-gray-200'
					}`}
				></div>
				<div
					className='flex items-center gap-3 cursor-pointer'
					onClick={() => {
						setview(2);
					}}
				>
					<div
						className={`w-10 h-10 flex justify-center items-center rounded-full ${
							stage === 2
								? 'bg-blue-600 text-white'
								: 'bg-gray-200 text-gray-500'
						}`}
					>
						3
					</div>
					<div>Recording</div>
				</div>
			</header>
			<main className='container mx-auto py-10'>
				{view === 0 && <Introduction setview={setview} />}

				{view === 1 &&
					(stage === 1 ? (
						<Preparation setview={setview} />
					) : (
						<div className='bg-white p-10 rounded-lg shadow-lg'>
							<p>
								You can proceed the recordings in the "Recording" section below.
							</p>
						</div>
					))}

				{view === 2 &&
					(stage !== 2 ? (
						<div className='bg-white p-10 rounded-lg shadow-lg'>
							<p>
								Please do a check first in the section "Qualification" section
								above.
							</p>
						</div>
					) : (
						<Recorder />
					))}
			</main>

			<footer></footer>
		</div>
	);
}

export default Main;
