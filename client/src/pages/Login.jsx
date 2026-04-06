import '../App.css';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import socket from '../utils/socket';
import PageWrapper from '../components/PageWrapper';
import {
  UsernameIcon, PasswordIcon, EyeIcon, EyeOffIcon, TickIcon
} from '../components/svg';

function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    remember: false,
  });
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    document.title = 'Login';
    const rememberedUsername = localStorage.getItem('rememberedUsername');
    if (rememberedUsername) {
      setFormData((prev) => ({
        ...prev,
        username: rememberedUsername,
        remember: true,
      }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleLogin = async () => {
    setLoginError('');

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/login`, {
        username: formData.username,
        password: formData.password,
      }, { withCredentials: true });

      const user = response.data.user;
      const token = response.data.accessToken;

      localStorage.setItem('username', user.username);
      localStorage.setItem('email', user.email);
      localStorage.setItem('token', token);

      if (formData.remember) {
        localStorage.setItem('rememberedUsername', user.username);
      } else {
        localStorage.removeItem('rememberedUsername');
      }

      socket.emit('join_user', user.username);

      const sharedRes = await axios.get(`${import.meta.env.VITE_API_URL}/tasks/shared`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const teamIds = sharedRes.data.teams.map(team => team._id);
      socket.emit('join_teams', teamIds);

      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      if (error.response) {
        const { status, data } = error.response;
        if (status === 404 && data.message === "User not found") {
          setLoginError('Username not found');
        } else if (status === 400 && data.message === "Invalid credentials") {
          setLoginError('Password is incorrect');
        } else {
          setLoginError('Something went wrong. Please try again.');
        }
      } else {
        setLoginError('Network error. Please check your connection.');
      }
    }
  };

  return (
    <PageWrapper>
      <div className="relative w-full h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/bg.jpg')] bg-center bg-cover z-0 opacity-30 dark:opacity-15" />

        {/* Decorative elements */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl hidden sm:block" />
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl hidden sm:block" />

        <div
          className="absolute z-10 hidden sm:block bg-[url('/login_image.png')] bg-cover bg-center opacity-60"
          style={{ width: '50vw', height: '50vw', top: '40vh', left: '50vw' }}
        />

        <div className="relative z-10 flex flex-col h-full px-4 sm:px-8 justify-start pt-[20vh]">
          <h1 className="text-slate-800 dark:text-white sm:ml-4.5 font-montserrat text-3xl sm:text-4xl font-bold text-center sm:text-left">
            Sign In
          </h1>

          <div className="flex flex-col gap-5 mt-6 items-center sm:items-start w-full max-w-xl">
            <div className="relative w-full px-4">
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter Username"
                className="RegisterInput"
              />
              <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                <UsernameIcon />
              </div>
            </div>

            <div className="relative w-full px-4">
              <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                <PasswordIcon />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter Password"
                className="RegisterInput"
              />
              <div
                className="absolute inset-y-0 right-6 flex items-center cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </div>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center gap-2 mt-6 px-4">
            <label htmlFor="remember" className="relative flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="remember"
                name="remember"
                checked={formData.remember}
                onChange={handleChange}
                className="peer w-5 h-5 appearance-none border border-slate-400 rounded-md bg-white
                           dark:bg-slate-800 checked:bg-indigo-500 dark:checked:bg-indigo-500 transition-all duration-200 grid place-content-center"
              />
              <TickIcon />
              <span className="ml-2 text-slate-700 dark:text-white font-montserrat text-base font-medium">
                Remember me
              </span>
            </label>
          </div>

          {loginError && (
            <div className="px-4 text-red-500 dark:text-red-400 mt-3 text-sm font-medium">{loginError}</div>
          )}

          <div className="mt-6 px-4">
            <button
              onClick={handleLogin}
              className="text-white bg-indigo-500 text-base w-full sm:w-60 h-14 font-semibold rounded-xl
                         transition-all duration-300 ease-in-out hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-500/25 active:scale-95"
            >
              Login
            </button>
          </div>

          <div className="mt-4 px-4 text-center sm:text-left">
            <p className="text-slate-700 dark:text-white font-montserrat text-base font-medium">
              Don't have an account?{' '}
              <span
                className="text-indigo-500 dark:text-indigo-400 hover:underline cursor-pointer transition-colors"
                onClick={() => navigate('/register')}
              >
                Create One
              </span>
            </p>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

export default Login;
