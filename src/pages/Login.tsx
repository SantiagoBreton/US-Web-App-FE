import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineMail, HiOutlineLockClosed } from 'react-icons/hi';
import { login } from '../api_calls/auth';
import { forgotPassword } from '../api_calls/forgot_password';
import ForgotPasswordModal from '../components/ForgotPasswordModal';
import FormInput from '../components/FormInput';
import logoUs from '../assets/Logo_Us_2.png';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (isLoggingIn) return; 
    
    setIsLoggingIn(true);
    try {
      const result = await login({ email, password });
      console.log('Login attempt:', { email, password });

      if (result.success) navigate("/dashboard");
      else setErrors({ email: result.message || 'Error en el inicio de sesión' });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleForgotPassword = async (email: string) => {
    await forgotPassword({ email });
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 via-gray-300 to-gray-600">
      <div className="bg-gradient-to-b from-white via-gray-50 to-gray-200 rounded-3xl shadow-xl p-10 max-w-md w-full animate-fadeIn">
        <div className="text-center mb-4">
          <img
            src={logoUs}
            alt="Logo US"
            className="mx-auto w-25 h-25"
          />
          <h1 className="text-3xl font-bold text-gray-800">Bienvenido a US</h1>
          <p className="text-gray-500 mt-2">Iniciá sesión para gestionar tu consorcio</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          
          <FormInput
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={setEmail}
            icon={HiOutlineMail}
            error={errors.email}
            disabled={isLoggingIn}
          />

          
          <FormInput
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={setPassword}
            icon={HiOutlineLockClosed}
            error={errors.password}
            showPasswordToggle
            disabled={isLoggingIn}
          />


          <div className="text-right">
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-sm text-gray-600 hover:text-gray-800 hover:underline cursor-pointer"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          
          <button
            type="submit"
            disabled={isLoggingIn}
            className={`cursor-pointer w-full font-bold py-3 rounded-lg shadow-md transition-all transform ${
              isLoggingIn 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-gray-400 via-gray-500 to-gray-700 text-white hover:from-gray-500 hover:via-gray-600 hover:to-gray-800 hover:scale-105'
            }`}
          >
            {isLoggingIn ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>

        
        <p className="text-center text-gray-600 mt-6">
          ¿No tenés cuenta?{' '}
          <span
            className="text-gray-800 hover:underline cursor-pointer"
            onClick={() => navigate('/register')}
          >
            Registrate
          </span>
        </p>

        <ForgotPasswordModal
          isVisible={showForgotPassword}
          onClose={() => setShowForgotPassword(false)}
          onSendEmail={handleForgotPassword}
        />
      </div>
    </div>
  );
}

export default Login;
