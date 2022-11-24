import { Fragment, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
	Legend,
	ResponsiveContainer,
	PieChart,
	Pie,
	Tooltip,
	BarChart,
	CartesianGrid,
	XAxis,
	YAxis,
	Bar,
} from 'recharts';
import _ from 'lodash';
import { saveAs } from 'file-saver';
import moment from 'moment';

import { FolderIcon } from '../components/icons/FolderIcon';
import { Menu, Transition } from '@headlessui/react';

import { niceBytes } from '../utils/helper';
import axios from 'axios';
import Pagination from '../components/Pagination';
import { config } from '../config';
import Modal from '../components/Modal';
import Canvas from '../components/Canvas';

function classNames(...classes) {
	return classes.filter(Boolean).join(' ');
}

const Label = ({
	label = 'label',
	item,
	count = 1,
	size = 0,
	allData = [],
	onClick,
	selectedLabel,
	initAdmin,
}) => {
	const [showModal, setShowModal] = useState(false);

	return (
		<div
			className={`label cursor-pointer p-2 border rounded flex justify-between ${
				selectedLabel === label ? 'bg-slate-200' : ''
			}`}
		>
			<div className='flex gap-2 items-center w-full' onClick={onClick}>
				<FolderIcon className='text-blue-700 w-8 h-8' />
				<div className=''>
					<div className='font-semibold'>{label}</div>
					<div className='text-sm text-slate-500'>{`${count} samples | ${niceBytes(
						size
					)}`}</div>
				</div>
			</div>
			<div className=''>
				<Menu as='div' className='relative inline-block text-left'>
					<div>
						<Menu.Button className='inline-flex z-0 justify-center p-1 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50  hover:text-gray-900'>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								viewBox='0 0 24 24'
								fill='currentColor'
								className='w-6 h-6 text-slate-300'
							>
								<path
									fillRule='evenodd'
									d='M10.5 6a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm0 6a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm0 6a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z'
									clipRule='evenodd'
								/>
							</svg>
						</Menu.Button>
					</div>

					<Transition
						as={Fragment}
						enter='transition ease-out duration-100'
						enterFrom='transform opacity-0 scale-95'
						enterTo='transform opacity-100 scale-100'
						leave='transition ease-in duration-75'
						leaveFrom='transform opacity-100 scale-100'
						leaveTo='transform opacity-0 scale-95'
					>
						<Menu.Items className='origin-top-right z-10 absolute right-0 mt-2 w-56 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none'>
							<div className='py-1'>
								<Menu.Item>
									{({ active }) => (
										<button
											className={classNames(
												active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
												`px-4 py-2 text-sm flex gap-2 items-center w-full ${
													item.count > 0 ? '' : 'opacity-70 pointer-events-none'
												}`
											)}
											onClick={() => {
												console.log('download labels: ', item);
												console.log(
													'label allData: ',
													allData.filter((i) => i.label === label)
												);

												const file = allData.filter(
													(i) => i.label === label
												)[0];

												if (file) {
													axios
														.post(
															'/api/zip',
															{
																// labels: allData,
																labels: allData.filter(
																	(i) => i.label === label
																),
															},
															{
																responseType: 'arraybuffer',
															}
														)
														.then((res) => {
															console.log('download response:', res);
															const blob = new Blob([res.data], {
																type: 'application/zip',
															});
															saveAs(blob, `${label}.zip`);
														})
														.catch((err) => {
															console.log('download error:', err);
														});
												}
											}}
										>
											<svg
												xmlns='http://www.w3.org/2000/svg'
												fill='none'
												viewBox='0 0 24 24'
												strokeWidth={1.5}
												stroke='currentColor'
												className='w-6 h-6 text-green-500'
											>
												<path
													strokeLinecap='round'
													strokeLinejoin='round'
													d='M12 9.75v6.75m0 0l-3-3m3 3l3-3m-8.25 6a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z'
												/>
											</svg>
											<span>Download</span>
										</button>
									)}
								</Menu.Item>
								<Menu.Item>
									{({ active }) => (
										<button
											className={classNames(
												active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
												`px-4 py-2 text-sm flex gap-2 items-center w-full ${
													item.count > 0 ? '' : 'opacity-70 pointer-events-none'
												}`
											)}
											onClick={() => {
												setShowModal(true);
											}}
										>
											<svg
												xmlns='http://www.w3.org/2000/svg'
												fill='none'
												viewBox='0 0 24 24'
												strokeWidth={1.5}
												stroke='currentColor'
												className='w-6 h-6 text-red-500'
											>
												<path
													strokeLinecap='round'
													strokeLinejoin='round'
													d='M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0'
												/>
											</svg>
											<span>Delete</span>
										</button>
									)}
								</Menu.Item>
							</div>
						</Menu.Items>
					</Transition>
				</Menu>
			</div>
			<Modal
				showModal={showModal}
				setShowModal={setShowModal}
				onModalAccept={() => {
					console.log('modal accepted');
					axios
						.post('/api/delete-labels', {
							labels: allData.filter((i) => i.label === label),
						})
						.then((res) => {
							console.log('delete res:', res);
							if (res.status === 200) {
								initAdmin();
								setShowModal(false);
							}
						})
						.catch((err) => {
							console.log('delete res error:', err);
						});
				}}
				onModalCancel={() => {
					console.log('modal cancel');
					setShowModal(false);
				}}
				labelName={label}
			/>
		</div>
	);
};

const AdminDashboard = () => {
	const [data, setData] = useState([]);
	const [allData, setAllData] = useState([]);
	const [isAuth, setisAuth] = useState(false);
	const [labels, setlabels] = useState(config.labels);
	const [data02, setdata02] = useState([
		{ name: 'Available', value: 30, fill: 'lightgray' },
		{ name: 'Used', value: 70, fill: '#1D4ED8' },
	]);
	const [currentPage, setCurrentPage] = useState(1);
	const [recordsPerPage] = useState(5);

	const [labelsData, setlabelsData] = useState([]);
	const [totalSize, settotalSize] = useState(0);
	const [selectedLabel, setselectedLabel] = useState('');
	const [showItemModal, setShowItemModal] = useState(false);
	const [selectedItem, setselectedItem] = useState({});
	const [auth, setauth] = useState('');

	const [chartData, setchartData] = useState([]);

	useEffect(() => {
		axios
			.get('/api/verify')
			.then((res) => {
				if (res.data.auth) {
					setauth(res.data.username);
				}
			})
			.catch((err) => console.log('err', err));
	}, []);

	const initAdmin = () => {
		axios
			.get('/api/recordings')
			.then((res) => {
				if (res.data.auth === false) {
					setisAuth(false);
				} else {
					setisAuth(true);
					console.log('recordings res', res);
					let total = config.storageLimit;
					let used = _.sumBy(res.data, 'fileSize');

					// calucalte used in percentage
					let usedPercentage = (used / total) * 100;
					// calculate available in percentage
					let availablePercentage = 100 - usedPercentage;

					setData(res.data);
					settotalSize(_.sumBy(res.data, 'fileSize'));
					setdata02([
						{
							name: 'Available',
							value: availablePercentage,
							fill: 'lightgray',
						},
						{ name: 'Used', value: usedPercentage, fill: '#1D4ED8' },
					]);
					setAllData(res.data);
					setchartData([
						{
							name: new Date().toLocaleDateString(),
							recordings: res.data.length,
						},
					]);
				}
			})
			.catch((err) => {
				setisAuth(false);
				console.log('recordings err', err);
			});
	};

	useEffect(() => {
		initAdmin();
	}, []);

	useEffect(() => {
		const dates = _.uniq(
			allData.map((item) => new Date(item.date).toLocaleDateString())
		);

		const copyData = allData.map((item) => ({
			...item,
			date: new Date(item.date).toLocaleDateString(),
		}));

		const groupedDataLabels = dates.map((item, idx) => {
			var obj = {};
			obj['name'] = item;
			obj['recordings'] = _.countBy(copyData, 'date')[item] ?? 0;
			return obj;
		});

		setchartData(groupedDataLabels);

		return () => {};
	}, [allData]);

	useEffect(() => {
		var result = {};

		Object.keys(_(allData).groupBy('label').value()).forEach(function (
			key,
			index
		) {
			result[key] = _.sumBy(
				_(allData).groupBy('label').value()[key],
				'fileSize'
			);
		});

		const groupedDataLabels = labels.map((item, idx) => {
			var obj = {};
			obj['label'] = item;
			obj['items'] = _.groupBy(allData, 'label')[item] ?? [];
			obj['count'] = _.countBy(allData, 'label')[item] ?? 0;
			obj['totalSize'] = result[item] ?? 0;
			return obj;
		});

		setlabelsData(groupedDataLabels);

		return () => {};
	}, [labels, allData]);

	useEffect(() => {
		const filteredData = allData.filter((item) => {
			const label = item.label.toLowerCase();
			const fileName = item.fileName.toLowerCase();
			const fileId = item.fileId.toLowerCase();
			return (
				label.includes(selectedLabel.toLowerCase()) ||
				fileName.includes(selectedLabel.toLowerCase()) ||
				fileId.includes(selectedLabel.toLowerCase())
			);
		});
		if (selectedLabel === '') {
			setData(allData);
		} else {
			setData(filteredData);
		}
	}, [selectedLabel]);

	const indexOfLastRecord = currentPage * recordsPerPage;
	const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;

	const nPages = Math.ceil(data.length / recordsPerPage);

	if (!isAuth) {
		return (
			<div>
				You are not authenticated!
				<Link to='/login'>
					<button>To Login</button>
				</Link>
			</div>
		);
	}

	return (
		<div className='flex min-h-screen'>
			<div className='border-r text-center p-4'>
				<div>
					<Link to='/'>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							viewBox='0 0 24 24'
							fill='currentColor'
							className='w-8 h-8 bg-blue-700 p-1 rounded-full text-white'
						>
							<path d='M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z' />
							<path d='M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z' />
						</svg>
					</Link>
				</div>
				<div className='mt-8 flex flex-col gap-4'>
					<div
						className='flex justify-center cursor-pointer hover:scale-125 transition-transform ease-in-out'
						onClick={() => {
							if (allData.length > 0) {
								axios
									.post(
										'/api/zip',
										{
											labels: allData,
										},
										{
											responseType: 'arraybuffer',
										}
									)
									.then((res) => {
										const blob = new Blob([res.data], {
											type: 'application/zip',
										});
										saveAs(
											blob,
											`RECORDINGS-${moment(new Date()).format('YYYYMMDD')}.zip`
										);
									})
									.catch((err) => {
										console.log('download error:', err);
									});
							}
						}}
					>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							fill='none'
							viewBox='0 0 24 24'
							strokeWidth={1.5}
							stroke='currentColor'
							className='w-8 h-8 text-green-500'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								d='M12 9.75v6.75m0 0l-3-3m3 3l3-3m-8.25 6a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z'
							/>
						</svg>
					</div>
				</div>
			</div>
			<div className='p-5 w-full bg-blue-50'>
				<div className='pb-4 flex justify-between'>
					<h1 className='font-semibold text-2xl'>Dashboard</h1>
					<div className='flex overflow-hidden gap-2 items-center'>
						<h3 className='text-xs font-semibold'>Welcome, {auth}!</h3>
					</div>
				</div>
				<div className='px-2 bg-white rounded-lg shadow mb-5 flex gap-2 items-center text-slate-400 text-sm w-[30%]'>
					<svg
						xmlns='http://www.w3.org/2000/svg'
						fill='none'
						viewBox='0 0 24 24'
						strokeWidth={1.5}
						stroke='currentColor'
						className='w-4 h-4'
					>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							d='M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z'
						/>
					</svg>

					<input
						className='w-full py-2 px-1 focus:outline-none'
						type='text'
						placeholder='Search for label, filename, date'
						onChange={(e) => setselectedLabel(e.target.value)}
					/>
				</div>
				<div className='p-5 bg-white rounded-lg shadow'>
					<h2 className='mb-3 font-semibold text-lg'>Daily Stats</h2>
					<div style={{ width: '100%', height: 230 }}>
						<ResponsiveContainer width='100%' height='100%'>
							<BarChart
								data={chartData}
								margin={{
									top: 5,
									right: 30,
									left: 20,
									bottom: 5,
								}}
							>
								<CartesianGrid strokeDasharray='3 3' />
								<XAxis dataKey='name' />
								<YAxis />
								<Tooltip />
								<Legend />
								<Bar dataKey='recordings' fill='#1D4ED8' />
							</BarChart>
						</ResponsiveContainer>
					</div>
				</div>
				<div className='flex '>
					<div className='mt-5 mr-5 p-5 bg-white rounded-lg shadow w-full'>
						<h2 className='mb-3 font-semibold text-lg'>All Audio Labels</h2>
						<div className='grid grid-cols-3 gap-3'>
							{labelsData.map((item, index) => {
								return (
									<Label
										key={index}
										label={item.label}
										count={item.count}
										size={item.totalSize}
										item={item}
										onClick={(e) => {
											setselectedLabel(item.label);
											if (selectedLabel === item.label) {
												setselectedLabel('');
											}
										}}
										selectedLabel={selectedLabel}
										allData={allData}
										initAdmin={initAdmin}
									/>
								);
							})}
						</div>
					</div>
					<div className='mt-5 p-5 bg-white rounded-lg shadow min-w-[300px] items-center flex'>
						<div className='' style={{ width: '100%', height: 130 }}>
							<ResponsiveContainer>
								<PieChart>
									<Pie
										data={data02}
										dataKey='value'
										endAngle={180}
										cy='100%'
										innerRadius={70}
										outerRadius={90}
										fill='#82ca9d'
									/>
									<Legend />
								</PieChart>
							</ResponsiveContainer>
						</div>
					</div>
				</div>

				{/* TABLE */}
				<div className='mt-5 p-5 bg-white rounded-lg shadow '>
					<table className='table-auto border-collapse w-full'>
						<thead>
							<tr className='text-left'>
								<th className='p-3'>
									<div>Filename</div>
								</th>
								<th className='p-3'>
									<div>Label</div>
								</th>
								<th className='p-3'>
									<div>User ID</div>
								</th>
								<th className='p-3'>
									<div>Session ID</div>
								</th>
								<th>
									<div className='flex gap-2 items-center'>
										<span>Filesize</span>
										<svg
											xmlns='http://www.w3.org/2000/svg'
											viewBox='0 0 20 20'
											fill='currentColor'
											className='w-4 h-4 cursor-pointer'
										>
											<path
												fillRule='evenodd'
												d='M2.24 6.8a.75.75 0 001.06-.04l1.95-2.1v8.59a.75.75 0 001.5 0V4.66l1.95 2.1a.75.75 0 101.1-1.02l-3.25-3.5a.75.75 0 00-1.1 0L2.2 5.74a.75.75 0 00.04 1.06zm8 6.4a.75.75 0 00-.04 1.06l3.25 3.5a.75.75 0 001.1 0l3.25-3.5a.75.75 0 10-1.1-1.02l-1.95 2.1V6.75a.75.75 0 00-1.5 0v8.59l-1.95-2.1a.75.75 0 00-1.06-.04z'
												clipRule='evenodd'
											/>
										</svg>
									</div>
								</th>
								<th>
									<div className='flex gap-2 items-center'>
										<span>Duration</span>
										<svg
											xmlns='http://www.w3.org/2000/svg'
											viewBox='0 0 20 20'
											fill='currentColor'
											className='w-4 h-4 cursor-pointer'
										>
											<path
												fillRule='evenodd'
												d='M2.24 6.8a.75.75 0 001.06-.04l1.95-2.1v8.59a.75.75 0 001.5 0V4.66l1.95 2.1a.75.75 0 101.1-1.02l-3.25-3.5a.75.75 0 00-1.1 0L2.2 5.74a.75.75 0 00.04 1.06zm8 6.4a.75.75 0 00-.04 1.06l3.25 3.5a.75.75 0 001.1 0l3.25-3.5a.75.75 0 10-1.1-1.02l-1.95 2.1V6.75a.75.75 0 00-1.5 0v8.59l-1.95-2.1a.75.75 0 00-1.06-.04z'
												clipRule='evenodd'
											/>
										</svg>
									</div>
								</th>
								<th>
									<div className='flex gap-2 items-center'>
										<span>Date</span>
										<svg
											xmlns='http://www.w3.org/2000/svg'
											viewBox='0 0 20 20'
											fill='currentColor'
											className='w-4 h-4 cursor-pointer'
										>
											<path
												fillRule='evenodd'
												d='M2.24 6.8a.75.75 0 001.06-.04l1.95-2.1v8.59a.75.75 0 001.5 0V4.66l1.95 2.1a.75.75 0 101.1-1.02l-3.25-3.5a.75.75 0 00-1.1 0L2.2 5.74a.75.75 0 00.04 1.06zm8 6.4a.75.75 0 00-.04 1.06l3.25 3.5a.75.75 0 001.1 0l3.25-3.5a.75.75 0 10-1.1-1.02l-1.95 2.1V6.75a.75.75 0 00-1.5 0v8.59l-1.95-2.1a.75.75 0 00-1.06-.04z'
												clipRule='evenodd'
											/>
										</svg>
									</div>
								</th>
								<th>Option</th>
							</tr>
						</thead>
						<tbody>
							{data
								.slice(indexOfFirstRecord, indexOfLastRecord)
								.map((item, index) => {
									return (
										<tr className='border-y hover:bg-slate-200' key={index}>
											<td className='p-3 max-w-max text-center'>
												<p>{item.fileName}</p>
												<div
													className={`mx-auto flex gap-0 py-3 my-2 mt-0 items-center h-28 w-64`}
												>
													<Canvas data={item.audioVolumeBufferStr.split(',')} />
												</div>
												<audio className='mx-auto' controls src={item.s3Url}>
													{/* <source src={item.s3Url} type='audio/wav' /> */}
													Your browser does not support the audio element.
												</audio>
											</td>
											<td className='p-3'>{item.label}</td>
											<td className='p-3'>{item.userId}</td>
											<td className='p-3'>{item.sessionId}</td>
											<td className='p-3'>{niceBytes(item.fileSize)}</td>
											<td className='p-3'>
												{/* {millisToMinutesAndSeconds(item.duration)} */}
												{new Date(item.duration * 1000)
													.toISOString()
													.substring(14, 19)}
											</td>
											<td className='p-3'>
												{new Date(item.date).toLocaleDateString()}
											</td>
											<td>
												<Menu
													as='div'
													className='relative inline-block text-left'
												>
													<div>
														<Menu.Button className='inline-flex z-0 justify-center p-1 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50  hover:text-blue-700'>
															<svg
																xmlns='http://www.w3.org/2000/svg'
																viewBox='0 0 24 24'
																fill='currentColor'
																className='w-6 h-6'
															>
																<path
																	fillRule='evenodd'
																	d='M10.5 6a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm0 6a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm0 6a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z'
																	clipRule='evenodd'
																/>
															</svg>
														</Menu.Button>
													</div>

													<Transition
														as={Fragment}
														enter='transition ease-out duration-100'
														enterFrom='transform opacity-0 scale-95'
														enterTo='transform opacity-100 scale-100'
														leave='transition ease-in duration-75'
														leaveFrom='transform opacity-100 scale-100'
														leaveTo='transform opacity-0 scale-95'
													>
														<Menu.Items className='origin-top-right z-10 absolute right-0 mt-2 w-56 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none'>
															<div className='py-1'>
																<Menu.Item>
																	{({ active }) => (
																		<button
																			className={classNames(
																				active
																					? 'bg-gray-100 text-gray-900'
																					: 'text-gray-700',
																				'px-4 py-2 text-sm flex gap-2 items-center w-full'
																			)}
																			onClick={() => {
																				if (item) {
																					axios
																						.post(
																							'/api/zip',
																							{
																								labels: allData.filter(
																									(i) =>
																										i.fileName === item.fileName
																								),
																							},
																							{
																								responseType: 'arraybuffer',
																							}
																						)
																						.then((res) => {
																							const blob = new Blob(
																								[res.data],
																								{
																									type: 'application/zip',
																								}
																							);
																							saveAs(
																								blob,
																								`${item.fileName.replace(
																									'.wav',
																									''
																								)}.zip`
																							);
																						})
																						.catch((err) => {
																							console.log(
																								'download error:',
																								err
																							);
																						});
																				}
																			}}
																		>
																			<svg
																				xmlns='http://www.w3.org/2000/svg'
																				fill='none'
																				viewBox='0 0 24 24'
																				strokeWidth={1.5}
																				stroke='currentColor'
																				className='w-6 h-6 text-green-500'
																			>
																				<path
																					strokeLinecap='round'
																					strokeLinejoin='round'
																					d='M12 9.75v6.75m0 0l-3-3m3 3l3-3m-8.25 6a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z'
																				/>
																			</svg>
																			<span>Download</span>
																		</button>
																	)}
																</Menu.Item>
																<Menu.Item>
																	{({ active }) => (
																		<button
																			className={classNames(
																				active
																					? 'bg-gray-100 text-gray-900'
																					: 'text-gray-700',
																				'flex items-center gap-2 px-4 py-2 text-sm w-full'
																			)}
																			onClick={() => {
																				setShowItemModal(true);
																				setselectedItem(item);
																			}}
																		>
																			<svg
																				xmlns='http://www.w3.org/2000/svg'
																				fill='none'
																				viewBox='0 0 24 24'
																				strokeWidth={1.5}
																				stroke='currentColor'
																				className='w-6 h-6 text-red-500'
																			>
																				<path
																					strokeLinecap='round'
																					strokeLinejoin='round'
																					d='M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0'
																				/>
																			</svg>
																			<span>Delete</span>
																		</button>
																	)}
																</Menu.Item>
															</div>
														</Menu.Items>
													</Transition>
												</Menu>
											</td>
										</tr>
									);
								})}
						</tbody>
					</table>
				</div>
				<Pagination
					nPages={nPages}
					currentPage={currentPage}
					setCurrentPage={setCurrentPage}
					dataLength={data.length}
				/>
				<Modal
					showModal={showItemModal}
					setShowModal={setShowItemModal}
					onModalAccept={() => {
						axios
							.post('/api/delete-labels', {
								labels: allData.filter(
									(i) => i.fileName === selectedItem.fileName
								),
							})
							.then((res) => {
								if (res.status === 200) {
									initAdmin();
									setShowItemModal(false);
								}
							})
							.catch((err) => {
								console.log('delete res error:', err);
							});
					}}
					onModalCancel={() => {
						setShowItemModal(false);
					}}
					item={selectedItem}
				/>
			</div>
		</div>
	);
};

export default AdminDashboard;
