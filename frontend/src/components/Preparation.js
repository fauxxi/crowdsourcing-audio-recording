import { useEffect, useState } from 'react';
import { samples } from '../utils/const';
import { shuffle } from '../utils/helper';
import { useStore } from '../utils/useStore';

const Preparation = ({ setview }) => {
	const setStage = useStore((state) => state.setStage);

	const [step, setstep] = useState(0);
	const [values, setvalues] = useState(['', '', '', '']);
	const [score, setscore] = useState(0);
	const [hasPassed, sethasPassed] = useState(false);
	const [hasSubmitted, sethasSubmitted] = useState(false);

	const Radio = ({ item, checked, onChange, onAudioPlay, label }) => (
		<div>
			<label className='gap-2 flex items-center'>
				<input
					type='radio'
					value={item.sample}
					checked={checked}
					onChange={onChange}
					disabled={hasSubmitted}
				/>
				{label}
			</label>
			<audio src={item.sample} controls onClick={onAudioPlay} />
		</div>
	);

	const RadioList = ({ items, value, onChange, onAudioPlay }) => (
		<div className='flex justify-center gap-24'>
			{items.map((item, idx) => (
				<Radio
					item={item}
					key={item.sample}
					checked={item.sample === value}
					onChange={onChange}
					onAudioPlay={onAudioPlay}
					label={idx % 2 === 0 ? 'A' : 'B'}
				/>
			))}
		</div>
	);

	const handleChange = (e, setValue, index) => {
		let vals = [...values];
		vals[index] = e.target.value;
		setValue(e.target.value);
		setvalues([...vals]);
		setstep(vals.filter((v) => v !== '').length);
		setscore(vals.filter((v) => v.includes('50S')).length);
	};

	const initSamples = () => {
		let arr = [];
		let obj = {};
		samples.forEach((sample, idx) => {
			console.log(sample[idx]);
			obj[idx] = shuffle(sample[idx]);
		});

		arr.push(obj);

		console.log(arr);
	};

	useEffect(() => {
		initSamples();
	}, []);

	useEffect(() => {
		console.log('values', values);
		console.log('step', step);
		console.log('score', score);
	}, [values, step, score]);

	useEffect(() => {
		console.log('hasPassed', hasPassed);
	}, [hasPassed]);

	useEffect(() => {
		document.addEventListener(
			'play',
			function (e) {
				var audios = document.getElementsByTagName('audio');
				for (var i = 0, len = audios.length; i < len; i++) {
					if (audios[i] !== e.target) {
						audios[i].pause();
					}
				}
			},
			true
		);

		return () => {};
	}, []);

	return (
		<div className='bg-white p-10 rounded-lg shadow-lg'>
			<h1 className='text-4xl mb-10 font-bold'>Qualification</h1>
			<div className='text-gray-700'>
				{' '}
				<h3>Which sample has a better quality compared to the other one?</h3>
				{values.slice(0, step + 1).map((v, i) => (
					<RadioList
						key={i}
						items={samples[i][i]}
						value={values[i]}
						onChange={(e) => handleChange(e, setvalues, i)}
						onAudioPlay={(e) => console.log('play', e)}
					/>
				))}
				{step === 4 && !hasSubmitted && (
					<button
						className='bg-slate-200 p-2 rounded-full px-4 mt-10'
						onClick={() => {
							sethasSubmitted(true);
							if (score > 2) sethasPassed(true);
							else sethasPassed(false);
						}}
					>
						Submit
					</button>
				)}
				{hasSubmitted && !hasPassed && score < 3 && (
					<div className=' mt-10'>
						<h3>
							You didn't passed the audio test, you might want to adjust your
							speaker level.
						</h3>
						<button
							className='bg-slate-200 p-2 rounded-full px-4 mt-3'
							onClick={() => {
								setstep(0);
								setvalues(['', '', '', '']);
								initSamples();
								sethasSubmitted(false);
							}}
						>
							Repeat test?
						</button>
					</div>
				)}
				{hasSubmitted && hasPassed && score > 2 && (
					<div className=' mt-10'>
						<h3>
							You passed the audio test, you can proceed to audio sample
							recording.
						</h3>
						<button
							className='bg-slate-200 p-2 rounded-full px-4 mt-3'
							onClick={() => {
								console.log('continue');
								setStage(2);
								setview(2);
							}}
						>
							Continue
						</button>
					</div>
				)}
			</div>
		</div>
	);
};

export default Preparation;
