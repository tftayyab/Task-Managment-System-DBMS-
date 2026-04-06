import '../App.css';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PageWrapper from '../components/PageWrapper';
import {
  ConfirmPasswordIcon, EmailIcon, EyeIcon, EyeOffIcon,
  FirstNameIcon, LastNameIcon, PasswordIcon, TickIcon, UsernameIcon
} from '../components/svg';

function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = 'Register';
  }, []);

  const handleRegister = async () => {
    setErrors([]);

    if (!formData.termsAccepted) {
      setErrors(["You must agree to the terms."]);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrors(["Passwords do not match."]);
      return;
    }

    const { confirmPassword, termsAccepted, ...payload } = formData;

    try {
      setLoading(true);
      await axios.post(`${import.meta.env.VITE_API_URL}/register`, payload);
      navigate("/login");
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else if (err.response?.data?.message) {
        setErrors([err.response.data.message]);
      } else {
        setErrors(["Something went wrong. Please try again."]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <div className="relative w-full h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">

        <div className="absolute inset-0 bg-[url('/bg.jpg')] bg-center bg-cover z-0 opacity-30 dark:opacity-15" />

        {/* Decorative elements */}
        <div className="absolute top-40 left-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl hidden sm:block" />
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl hidden sm:block" />

        <div
          className="absolute z-10 hidden sm:block bg-[url('/register_image.png')] bg-cover bg-center opacity-50"
          style={{
            width: '50vw',
            height: '90vw',
            top: '10vh',
            right: '50vw',
          }}
        />

        <div className="relative z-10 h-full flex justify-center sm:justify-end items-start pt-[5vh] pr-0 sm:pr-[8vw]">
          <div className="w-full sm:w-[420px] flex flex-col items-center sm:items-start">

            <h1 className="text-slate-800 dark:text-white mt-8 sm:mt-1 font-montserrat text-3xl sm:text-4xl font-bold leading-tight text-center sm:text-left ml-3">
              Sign Up
            </h1>

            <div className="flex flex-col gap-5 mt-5 sm:gap-2.5 sm:mt-5 items-center sm:items-start w-85 sm:w-full max-w-xl">
              {[
                { icon: <FirstNameIcon />, name: 'firstName', placeholder: 'Enter First Name' },
                { icon: <LastNameIcon />, name: 'lastName', placeholder: 'Enter Last Name' },
                { icon: <UsernameIcon />, name: 'username', placeholder: 'Enter Username' },
                { icon: <EmailIcon />, name: 'email', placeholder: 'Enter Email', type: 'email' }
              ].map(({ icon, name, placeholder, type = 'text' }) => (
                <div key={name} className="relative w-full px-4">
                  <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">{icon}</div>
                  <input
                    type={type}
                    placeholder={placeholder}
                    className="RegisterInput"
                    value={formData[name]}
                    onChange={(e) => setFormData({ ...formData, [name]: e.target.value })}
                  />
                </div>
              ))}

              {/* Password */}
              <div className="relative w-full px-4">
                <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none"><PasswordIcon /></div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter Password"
                  className="RegisterInput"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <div className="absolute inset-y-0 right-6 flex items-center cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </div>
              </div>

              {/* Confirm Password */}
              <div className="relative w-full px-4">
                <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none"><ConfirmPasswordIcon /></div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  className="RegisterInput"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
                <div className="absolute inset-y-0 right-6 flex items-center cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </div>
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-center gap-2 mt-6 sm:mt-3 px-4">
              <label htmlFor="terms" className="relative flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id="terms"
                  name="termsAccepted"
                  checked={formData.termsAccepted}
                  onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
                  className="peer w-5 h-5 appearance-none border border-slate-400 rounded-md bg-white dark:bg-slate-800 
                             checked:bg-indigo-500 dark:checked:bg-indigo-500 transition-all duration-200 grid place-content-center"
                />
                <TickIcon />
                <span className="ml-2 text-slate-700 dark:text-white font-montserrat text-base font-medium">
                  I agree to all terms
                </span>
              </label>
            </div>

            {/* Errors */}
            {errors.length > 0 && (
              <div className="px-4 text-red-500 dark:text-red-400 mt-2">
                <ul className="list-disc ml-4 text-sm">
                  {errors.map((err, idx) => <li key={idx}>{err}</li>)}
                </ul>
              </div>
            )}

            {/* Submit */}
            <div className="mt-2 sm:mt-4 px-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
              <button
                className="text-white bg-indigo-500 text-sm sm:text-base font-semibold px-6 py-3 sm:px-10 sm:py-4 rounded-xl 
                           transition-all duration-300 ease-in-out hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-500/25 active:scale-95"
                onClick={handleRegister}
                disabled={loading}
              >
                {loading ? 'Registering...' : 'Register'}
              </button>

              <p className="text-slate-700 dark:text-white font-montserrat text-base font-medium text-center sm:text-left sm:ml-12">
                Already have an account?{' '}
                <span
                  className="text-indigo-500 dark:text-indigo-400 hover:underline cursor-pointer transition-colors"
                  onClick={() => navigate('/login')}
                >
                  Sign In
                </span>
              </p>
            </div>

          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

export default Register;
