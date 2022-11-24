import step1 from '../img/step1.png';
import step2 from '../img/step2.png';
import { useStore } from '../utils/useStore';
import { config } from '../config';

const Introduction = ({ setview }) => {
	const stage = useStore((state) => state.stage);
	const setStage = useStore((state) => state.setStage);
	const { minDuration } = config;

	return (
		<div className='bg-white p-10 rounded-lg shadow-lg'>
			<h1 className='text-4xl mb-10 font-bold'>Introduction</h1>
			<div className='text-gray-700'>
				<p>
					Welcome! You are about to participate in audio samples collection!
					This HIT has two section:
				</p>
				<ul>
					<li>
						&bull; <span className='font-bold'>Qualification (just once)</span>:
						Check if you are eligible to perform this HIT
					</li>
					<li>
						&bull; <span className='font-bold'>Recording</span>: Record audio
						sample(s) according to label, and submit
					</li>
				</ul>
				<br />
				<p>
					You should follow the below mentioned rules &amp; preparations,
					otherwise your submission will be invalid.
				</p>
				<p className='font-bold'>Rules &amp; Preparations: </p>
				<ul>
					<li>&bull; You must perform the task in a quiet environment</li>
					<li>
						&bull; You will need a working{' '}
						<span className='font-bold'>microphone</span>, either internal or
						external.
					</li>
					<li>
						&bull; Each recording must be at least{' '}
						<span className='font-bold'>5 seconds</span> long, otherwise your
						recording will be invalid.
					</li>
				</ul>
				<br />
				<p className='font-bold'>Payment: </p>
				<p></p>
				<br />
				<p className='font-bold'>Instructions: </p>
				<ul>
					<li>
						&bull; Step 1: Record at least {minDuration} seconds of audio
						according to the label, by pressing "Rec" for recording and "Stop"
						for stopping.
						<img className='mx-auto' src={step1} />
					</li>
					<li>
						&bull; Step 2: After you've recorded at least one clip for each
						label, a SUBMIT button will appear. <br />
						However, make sure you've recorded the correct label. You can review
						them, and remove and repeat recording if needed.
						<img className='mx-auto' src={step2} />
					</li>
				</ul>
			</div>
			<label className='flex gap-3 items-center'>
				<input
					type='checkbox'
					className=''
					checked={stage === 0 ? false : true}
					onChange={() => setStage(1)}
				/>
				<p>I have read the above instructions and I am ready to start</p>
			</label>
			<button
				className='bg-slate-200 p-2 rounded-full px-4 mt-3'
				onClick={() => {
					console.log('continue');
					setview(1);
				}}
			>
				Continue
			</button>
		</div>
	);
};

export default Introduction;
