import { useEffect, useRef, useState } from 'react';
import { areEqual } from '../utils/helper';
import { Tab } from '@headlessui/react';
import { useStore } from '../utils/useStore';
import { customAlphabet } from 'nanoid';
import moment from 'moment';

import axios from 'axios';
import _ from 'lodash';
import { useLiveQuery } from 'dexie-react-hooks';

import { config } from '../config';
import { db } from '../utils/db';
import Canvas from './Canvas';

const BUCKET_URL = `https://${process.env.REACT_APP_BUCKET_NAME}.s3.eu-central-1.amazonaws.com/`;
const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 5);

function classNames(...classes) {
	return classes.filter(Boolean).join(' ');
}

const b64toBlob = (b64Data = '', contentType = 'audio/wav') => {
	var byteString = atob(b64Data.split(',')[1]);
	var ab = new ArrayBuffer(byteString.length);
	var ia = new Uint8Array(ab);

	for (var i = 0; i < byteString.length; i++) {
		ia[i] = byteString.charCodeAt(i);
	}
	return new Blob([ab], { type: contentType });
};

const Recorder = () => {
	const id = useStore((state) => state.id);
	const sessionId = useStore((state) => state.sessionId);
	const setSessionId = useStore((state) => state.setSessionId);
	const hasSubmitted = useStore((state) => state.hasSubmitted);
	const setHasSubmitted = useStore((state) => state.setHasSubmitted);
	const [canStopRecording, setcanStopRecording] = useState(false);

	const canvas = useRef(null);
	const record = useRef(null);
	const stop = useRef(null);
	const [uploadingStatus, setUploadingStatus] = useState('');

	const [selectedTab, setselectedTab] = useState(0);

	const [labels, setlabels] = useState(config.labels);

	const [selectedMic, setselectedMic] = useState('');

	const [isPaused, setIsPaused] = useState(true);
	const [elapsedTime, setelapsedTime] = useState(0);

	const [recordingDuration, setrecordingDuration] = useState({
		start: Date.now(),
		end: Date.now(),
	});

	const [isRecording, setisRecording] = useState(false);

	const recordedData = useLiveQuery(() => db.recording.toArray());

	useEffect(() => {
		if (sessionId === '') {
			setSessionId(nanoid());
		}
	}, [sessionId]);

	useEffect(() => {
		const canvasCtx = canvas.current.getContext('2d');
		canvas.current.width = canvas.current.offsetWidth;
		canvas.current.height = canvas.current.offsetHeight;

		const HEIGHT = canvas.current.height;
		const WIDTH = canvas.current.width;

		if (navigator.mediaDevices === undefined) {
			navigator.mediaDevices = {};
		}

		// Some browsers partially implement mediaDevices. We can't assign an object
		// with getUserMedia as it would overwrite existing properties.
		// Add the getUserMedia property if it's missing.
		if (navigator.mediaDevices.getUserMedia === undefined) {
			navigator.mediaDevices.getUserMedia = function (constraints) {
				// First get ahold of the legacy getUserMedia, if present
				const getUserMedia =
					navigator.webkitGetUserMedia ||
					navigator.mozGetUserMedia ||
					navigator.msGetUserMedia;

				// Some browsers just don't implement it - return a rejected promise with an error
				// to keep a consistent interface
				if (!getUserMedia) {
					return Promise.reject(
						new Error('getUserMedia is not implemented in this browser')
					);
				}

				// Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
				return new Promise(function (resolve, reject) {
					getUserMedia.call(navigator, constraints, resolve, reject);
				});
			};
		}

		// Set up forked web audio context, for multiple browsers
		// window. is needed otherwise Safari explodes
		const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
		let source;

		// Set up the different audio nodes we will use for the app
		const analyser = audioCtx.createAnalyser();
		analyser.minDecibels = -90;
		analyser.maxDecibels = -10;
		analyser.smoothingTimeConstant = 0.85;

		// Main block for doing the audio recording
		if (navigator.mediaDevices.getUserMedia) {
			console.log('getUserMedia supported.');
			const constraints = { audio: true };
			navigator.mediaDevices
				.getUserMedia(constraints)
				.then(function (stream) {
					source = audioCtx.createMediaStreamSource(stream);
					source.connect(analyser);
				})
				.catch(function (err) {
					console.log('The following gUM error occured: ' + err);
				});
		} else {
			console.log('getUserMedia not supported on your browser!');
		}

		analyser.fftSize = 2048;
		const bufferLength = analyser.frequencyBinCount;

		// We can use Float32Array instead of Uint8Array if we want higher precision
		// const dataArray = new Float32Array(bufferLength);
		const dataArray = new Uint8Array(bufferLength);

		canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

		const draw = function () {
			analyser.getByteTimeDomainData(dataArray);
			canvasCtx.fillStyle = '#eff6ff';
			canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

			canvasCtx.lineWidth = 2;
			canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

			canvasCtx.beginPath();

			const sliceWidth = (WIDTH * 1.0) / bufferLength;
			let x = 0;

			for (let i = 0; i < bufferLength; i++) {
				let v = dataArray[i] / 128.0;
				let y = (v * HEIGHT) / 2;

				if (i === 0) {
					canvasCtx.moveTo(x, y);
				} else {
					canvasCtx.lineTo(x, y);
				}

				x += sliceWidth;
			}

			canvasCtx.lineTo(WIDTH, HEIGHT / 2);
			canvasCtx.stroke();
			requestAnimationFrame(draw);
		};

		draw();
	});

	useEffect(() => {
		let interval = null;

		if (isRecording && isPaused === false) {
			interval = setInterval(() => {
				setelapsedTime((time) => time + 1);
			}, 1000);
		} else {
			clearInterval(interval);
		}

		return () => {
			clearInterval(interval);
		};
	}, [isRecording, isPaused]);

	useEffect(() => {
		if (!navigator.getUserMedia)
			navigator.getUserMedia =
				navigator.webkitGetUserMedia ||
				navigator.mozGetUserMedia ||
				navigator.msGetUserMedia;

		if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
			if (!navigator.mediaDevices?.enumerateDevices) {
				console.log('enumerateDevices() not supported.');
			} else {
				// List microphones.
				navigator.mediaDevices
					.enumerateDevices()
					.then(function (devices) {
						const audioInputDevices = devices.filter(function (device) {
							return (
								device.kind === 'audioinput' && device.deviceId === 'default'
							);
						});

						audioInputDevices.forEach(function (device) {
							setselectedMic(device.label);
						});
					})
					.catch(function (err) {
						console.log(err.name + ': ' + err.message);
					});
			}

			navigator?.mediaDevices
				?.getUserMedia({
					audio: true,
				})
				.then(function (stream) {
					const mediaRecorder = new MediaRecorder(stream);
					let chunks = [];
					let clipName = '';

					record.current.onclick = () => {
						setisRecording(true);
						setIsPaused(false);
						setelapsedTime(0);
						mediaRecorder.start();

						setrecordingDuration({
							...recordingDuration,
							start: Date.now(),
						});
					};

					mediaRecorder.ondataavailable = function (e) {
						chunks.push(e.data);
					};

					stop.current.onclick = () => {
						clipName = labels[selectedTab];
						setisRecording(false);
						setIsPaused(true);
						mediaRecorder.stop();

						setrecordingDuration({
							...recordingDuration,
							end: Date.now(),
						});
					};

					mediaRecorder.onstop = async (e) => {
						let buff = [];
						const nanoid = customAlphabet(
							'0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
							5
						);

						const fileId = nanoid();

						setelapsedTime(0);

						const blob = new Blob(chunks, {
							type: 'audio/wav',
						});
						chunks = [];

						const arrayBuffer = await blob.arrayBuffer();
						const audioCtx = new AudioContext();
						const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

						const offlineAudioContext = new OfflineAudioContext(
							audioBuffer.numberOfChannels,
							audioBuffer.length,
							audioBuffer.sampleRate
						);

						var bufferSource = offlineAudioContext.createBufferSource();
						bufferSource.buffer = audioBuffer;

						var analyser = offlineAudioContext.createAnalyser();
						analyser.fftSize = 2048;
						const bufferLength = analyser.frequencyBinCount;
						var freqData = new Float32Array(bufferLength);

						var scp = offlineAudioContext.createScriptProcessor(256, 0, 1);
						bufferSource.connect(analyser);
						scp.connect(offlineAudioContext.destination); // this is necessary for the script processor to start

						scp.onaudioprocess = function () {
							analyser.getFloatTimeDomainData(freqData);
							let sumSquares = 0.0;
							for (const amplitude of freqData) {
								sumSquares += amplitude * amplitude;
							}
							buff.push(
								parseFloat(Math.sqrt(sumSquares / freqData.length).toFixed(5))
							);
						};

						bufferSource.start(0);
						offlineAudioContext.oncomplete = async function (e) {
							const date = new Date();
							const formatedDate = moment(date).format('YYYYMMDD');

							const fileName = `${formatedDate}-${id}-${fileId}.wav`;

							const file = new File([blob], fileName, {
								type: 'audio/wav',
							});

							var base64String;
							var reader = new FileReader();
							reader.readAsDataURL(blob);
							reader.onloadend = async function () {
								base64String = reader.result;

								const recordingObj = {
									id: 'RECORDING',
									fileId: `${id}-${fileId}`,
									userId: id,
									sessionId: sessionId,
									label: labels[selectedTab],
									fileName: fileName,
									duration: audioBuffer.duration,
									fileSize: file.size,
									date: Date.now(),
									s3Url:
										BUCKET_URL +
										`${encodeURIComponent(labels[selectedTab])}/${fileName}`,
									base64String,
									audioVolumeBuffer: buff,
									audioVolumeBufferStr: buff.join(),
								};

								const recordedId = await db.recording.add(recordingObj);
							};
						};
						offlineAudioContext.startRendering();
					};
				})
				.catch(function (err) {
					console.log('The following gUM error occured: ' + err);
				});
		} else {
			console.log('getUserMedia not supported on your browser!');
		}
	}, [labels, selectedMic, selectedTab]);

	useEffect(() => {
		const duration = elapsedTime;
		if (duration >= config.minDuration) {
			setcanStopRecording(true);
		} else {
			setcanStopRecording(false);
		}
	}, [elapsedTime]);

	const uploadFile = async (recording) => {
		setUploadingStatus('Uploading the file to AWS S3');

		const { base64String, label, fileName } = recording;

		let { data } = await axios.post('/api/upload', {
			label: label,
			name: fileName,
			type: 'audio/wav',
		});

		const url = data.url;
		let uploadFileData = await axios
			.put(url, b64toBlob(base64String))
			.then((res) => {
				if (res.status === 200) {
					saveToDb(recording);
				} else {
					console.log('Error uploading to AWS S3', res);
				}
			})
			.catch((err) => {
				console.log(err);
			});

		return null;
	};

	const saveToDb = async (recordedAudio) => {
		const dbObject = _.omit(recordedAudio, [
			'file',
			'blob',
			'audioVolumeBuffer',
			'base64String',
		]);

		let data = await axios.put('/api/db', dbObject);

		if (data.status === 201) {
			await db.recording.clear();
		}
	};

	return (
		<div className='min-w-full'>
			<div className='flex flex-col items-center'>
				<div className='bg-white p-10 rounded-lg shadow-lg'>
					<h1 className='text-2xl'>Recording Audio Samples</h1>
					<div>
						<p>
							Selected audio input:{' '}
							<i className=''>
								{selectedMic
									? selectedMic
									: 'This browser does not support select the microphone.'}
							</i>
						</p>
						<p className='mb-5'>
							Make sure the selected audio input above is correct. <br />
							Otherwise, setup your audio input, and reload this page.
						</p>

						<h1 className='text-xl font-bold'>Task:</h1>
						<p>
							Please record an audio for each label below. You can record
							multiple audio files for each label. After you've recorded all the
							labels, you can finally submit the recorded clips by clicking the{' '}
							<span className='font-bold'>SUBMIT</span> button, which will
							appear after you've recorded all the labels. You can also freely
							navigate to other tabs, e.g. to review your recordings.
						</p>
					</div>
				</div>
				<div className='mx-auto my-10'>
					<canvas ref={canvas}></canvas>
				</div>
				{labels.length > 0 && (
					<div className='mb-10'>
						<div className='text-3xl text-center mb-10'>
							{`0${Math.floor(elapsedTime / 60) % 60}`.slice(-2)}:
							{`0${elapsedTime % 60}`.slice(-2)}
						</div>

						<div className='flex gap-10 text-white items-end'>
							<div
								ref={record}
								className={`disabled cursor-pointer h-16 w-16 flex justify-center items-center ${
									isRecording
										? 'bg-slate-600 pointer-events-none '
										: 'bg-green-600 pointer-events-auto'
								} rounded-full`}
							>
								Rec
							</div>
							<div className='relative'>
								{isRecording && !canStopRecording && (
									<div className='rounded-md absolute -top-10 whitespace-nowrap bg-slate-600 text-white p-2 mb-2 text-sm'>
										Record at least for {config.minDuration}s
									</div>
								)}
								<div
									ref={stop}
									className={`disabled cursor-pointer h-16 w-16 flex justify-center items-center rounded-full ${
										isRecording && canStopRecording
											? 'bg-red-600 pointer-events-auto'
											: 'bg-slate-600 pointer-events-none'
									}`}
								>
									Stop
								</div>
							</div>
						</div>
					</div>
				)}
				<div className='w-full px-2 sm:px-0'>
					<Tab.Group
						onChange={(index) => {
							setselectedTab(index);
						}}
					>
						<Tab.List className='flex space-x-1 rounded-xl bg-blue-900/20 p-1'>
							{labels.map((label) => (
								<Tab
									key={label}
									className={({ selected }) =>
										classNames(
											'outline-none w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700 ',
											selected
												? 'bg-white shadow'
												: 'hover:bg-white/[0.12] hover:text-white'
										)
									}
								>
									{label}
								</Tab>
							))}
						</Tab.List>
						<Tab.Panels className='mt-2 flex justify-center'>
							{labels.map((label, idx) => (
								<Tab.Panel
									key={idx}
									className={classNames(
										'rounded-xl p-3',
										'border-none focus:ring-0'
									)}
								>
									<div className='mt-2'>
										{!_.isEmpty(recordedData) &&
											recordedData
												.filter(
													(recordedAudio) => recordedAudio.label === labels[idx]
												)
												.map((data, idx) => {
													return (
														<article
															key={idx}
															className='bg-white p-5 rounded-lg shadow-lg mb-5 text-center w-full'
														>
															<div className='flex justify-between'>
																<p className='text-sm font-medium text-center'>
																	{data?.fileName}
																</p>
																<p className='text-sm font-medium text-center'>
																	{new Date(data?.duration * 1000)
																		.toISOString()
																		.substring(14, 19)}
																</p>
															</div>

															<div className='h-28 my-3'>
																<Canvas data={data.audioVolumeBuffer} />
															</div>

															<div className='flex justify-between gap-8 items-center'>
																<audio
																	src={window.URL.createObjectURL(
																		b64toBlob(data?.base64String, 'audio/mp3')
																	)}
																	type='audio/mp3'
																	preload='auto'
																	controls
																>
																	<source
																		src={window.URL.createObjectURL(
																			b64toBlob(data?.base64String, 'audio/mp3')
																		)}
																		type='audio/mp3'
																	/>
																	Your browser does not support the audio
																	element.
																</audio>
																<button
																	className='bg-red-600 hover:bg-red-700 text-white py-1 px-2 rounded-full mt-5'
																	onClick={async () => {
																		let deletedRecording =
																			await db.recording.delete(data?.fileId);
																	}}
																>
																	Delete
																</button>
															</div>
														</article>
													);
												})}
									</div>
								</Tab.Panel>
							))}
						</Tab.Panels>
					</Tab.Group>
				</div>

				{labels.length > 0 && (
					<div className='flex flex-col items-center'>
						{areEqual(
							_.uniqBy(recordedData, 'label').map((item) => item.label),
							labels
						) ? (
							<div className='mt-10 text-center'>
								<p>
									You can submit all clips now. Please make sure all clips are
									fine.
								</p>
								<button
									className='bg-blue-500 text-white py-2 px-4 rounded-full mt-2 mb-8'
									onClick={() => {
										const sessId = nanoid();
										setSessionId(sessId);

										recordedData.map((data, idx) => {
											uploadFile({ ...data, sessionId: sessId });
										});
										setHasSubmitted(true);
									}}
								>
									SUBMIT
								</button>
							</div>
						) : (
							<div className='mt-10 text-center'>
								{!hasSubmitted && (
									<p>Please record at least one clip for each sample/label</p>
								)}
							</div>
						)}
						{hasSubmitted && (
							<div>
								<p>
									Save the Session ID below in order to get paid. <br />
									Session ID:
									<span className='font-bold'> {sessionId}</span>
								</p>
								<button
									className='bg-green-500 text-white py-2 px-4 rounded-full mt-2 mb-8'
									onClick={() => {
										setHasSubmitted(false);
									}}
								>
									Submit another?
								</button>
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
};

export default Recorder;
