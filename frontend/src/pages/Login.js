import axios from 'axios';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import dashboard from '../img/dashboard.png';

axios.defaults.withCredentials = true;

const Login = () => {
	let navigate = useNavigate();
	const [credential, setcredential] = useState({ username: '', password: '' });
	const [authError, setauthError] = useState('');
	const [auth, setauth] = useState('');

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

	const authenticate = (e) => {
		e.preventDefault();
		axios
			.post('/api/auth', {
				credential,
			})
			.then((res) => {
				if (res.data.auth) {
					setauthError('');
					navigate('/admin');
				} else {
					setauthError(res.data.err);
				}
			})
			.catch((err) => {
				console.log('login err', err);
			});
	};

	return (
		<div className='flex h-screen w-full bg-blue-700'>
			<div className='text-white w-[60%] relative overflow-hidden p-5'>
				<svg
					xmlns='http://www.w3.org/2000/svg'
					viewBox='0 0 24 24'
					fill='currentColor'
					className='w-12 h-12 bg-blue-700 p-1 rounded-full text-white'
				>
					<path d='M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z' />
					<path d='M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z' />
				</svg>
				<div className='mt-16 p-10'>
					<h1 className='font-semibold text-3xl tracking-wide mb-3'>
						Designed for researcher.
					</h1>
					<h2 className='font-thin'>
						Deploy on your choice of linux virtual machine. Crowdsourcing
						platform ready. Gather audio samples without the hassle.
					</h2>
				</div>
				<img
					className='absolute bottom-0 -right-10 shadow-2xl w-[60%]'
					src={dashboard}
				/>
			</div>
			<div className='bg-white p-[7%] w-[40%] flex flex-col justify-center'>
				{auth !== '' ? (
					<div>
						<h1 className='text-3xl mb-5'>
							Hello{' '}
							<span className='bg-blue-50 text-blue-600 font-semibold'>
								{auth}
							</span>
							, welcome back!
						</h1>
						<Link to='/admin'>
							<button className='bg-blue-700 text-white w-full rounded-lg p-2 shadow-lg shadow-blue-700/50 hover:bg-blue-500 transition duration-300 ease-in-out'>
								To Dashboard
							</button>
						</Link>
					</div>
				) : (
					<div>
						<h1 className='text-3xl font-semibold mb-5'>Log in</h1>
						<form>
							<div className='flex flex-col mb-3'>
								<label>Username</label>
								<input
									type='text'
									className='border rounded-lg p-2'
									placeholder='admin'
									onChange={(e) =>
										setcredential({ ...credential, username: e.target.value })
									}
									required
								/>
							</div>
							<div className='flex flex-col mb-3'>
								<label>Password</label>
								<input
									type='password'
									className='border rounded-lg p-2 '
									placeholder='admin'
									onChange={(e) =>
										setcredential({ ...credential, password: e.target.value })
									}
									required
								/>
							</div>
							<p className='text-red-500'>{authError}</p>
							<button
								className='bg-blue-700 text-white w-full rounded-lg p-2 shadow-lg shadow-blue-700/50 hover:bg-blue-500 transition duration-300 ease-in-out'
								onClick={authenticate}
								type='submit'
							>
								Sign in
							</button>
						</form>
					</div>
				)}
			</div>
		</div>
	);
};

export default Login;
