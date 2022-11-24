import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Main from './pages/Main';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import Page404 from './pages/Page404';

function App() {
	return (
		<Router>
			<Routes>
				<Route path='*' element={<Page404 />} />
				<Route exact path='/' element={<Main />} />
				<Route path='/admin' element={<AdminDashboard />} />
				<Route path='/login' element={<Login />} />
			</Routes>
		</Router>
	);
}

export default App;
