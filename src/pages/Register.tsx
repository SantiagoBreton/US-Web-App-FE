import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineUser, HiOutlineHome } from 'react-icons/hi';
import { register } from '../api_calls/auth';
import { getApartments, type Apartment } from '../api_calls/get_apartments';
import RegistrationSuccessToast from '../components/RegistrationSuccessToast';
import FormInput from '../components/FormInput';
import SelectInput from '../components/SelectInput';
import PasswordRequirements from '../components/PasswordRequirements';
import { validatePassword } from '../utils/passwordValidation';
import logoUs from '../assets/Logo_Us_2.png';

function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [apartmentId, setApartmentId] = useState<string>('');
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    apartment?: string;
  }>({});

  useEffect(() => {
    const loadApartments = async () => {
      try {
        const apartmentData = await getApartments();
        setApartments(apartmentData);
      } catch (error) {
        console.error('Error loading apartments:', error);
      }
    };
    loadApartments();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const tempErrors: typeof errors = {};

    if (!name) tempErrors.name = 'El nombre es obligatorio';
    if (!email) tempErrors.email = 'El correo es obligatorio';
    
    const passwordValidation = validatePassword(password, confirmPassword);
    if (!passwordValidation.isValid && passwordValidation.errors.length > 0) {
      tempErrors.password = passwordValidation.errors[0];
    }
    
    if (password !== confirmPassword && password && confirmPassword) {
      tempErrors.confirmPassword = 'Las contraseñas no coinciden';
    }
    if (apartmentId === '') tempErrors.apartment = 'Debes seleccionar un apartamento';

    setErrors(tempErrors);

    if (Object.keys(tempErrors).length === 0) {
      if (isRegistering) return;
      
      setIsRegistering(true);
      try {
        const result = await register({
          name,
          email,
          password,
          apartmentId
        });
        
        if (result.success) {
          setShowSuccessToast(true);
        } else {
          setErrors({ email: result.message || 'Error en el registro' });
        }
      } finally {
        setIsRegistering(false);
      }
    }
  };

  const handleToastComplete = () => {
    setShowSuccessToast(false);
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 via-gray-300 to-gray-600">
      <div className="bg-gradient-to-b from-white via-gray-50 to-gray-200 rounded-3xl shadow-xl p-10 max-w-md w-full animate-fadeIn">
        <div className="text-center mb-6">
          <img src={logoUs} alt="Logo US" className="mx-auto w-20 h-20" />
          <h1 className="text-3xl font-bold text-gray-800">Crear cuenta</h1>
          <p className="text-gray-500 mt-2">Registrate para gestionar tu consorcio</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          {/* Name */}
          <FormInput
            placeholder="Nombre completo"
            value={name}
            onChange={setName}
            icon={HiOutlineUser}
            error={errors.name}
            disabled={isRegistering}
          />

          {/* Email */}
          <FormInput
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={setEmail}
            icon={HiOutlineMail}
            error={errors.email}
            disabled={isRegistering}
          />

          {/* Apartment */}
          <SelectInput
            placeholder="Selecciona un apartamento"
            value={apartmentId || ''}
            onChange={(value) => setApartmentId(value)}
            options={apartments.map(apartment => ({
              value: apartment.id.toString(),
              label: apartment.unit
            }))}
            icon={HiOutlineHome}
            error={errors.apartment}
            disabled={isRegistering}
          /> 

          {/* Password */}
          <div>
            <FormInput
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={setPassword}
              icon={HiOutlineLockClosed}
              error={errors.password}
              showPasswordToggle
              onFocus={() => setShowPasswordRequirements(true)}
              onBlur={() => setShowPasswordRequirements(false)}
              disabled={isRegistering}
            />
            
            <PasswordRequirements
              password={password}
              isVisible={showPasswordRequirements}
              className="mt-2"
            />
          </div>

          {/* Confirm Password */}
          <FormInput
            type="password"
            placeholder="Confirmar contraseña"
            value={confirmPassword}
            onChange={setConfirmPassword}
            icon={HiOutlineLockClosed}
            error={errors.confirmPassword}
            showPasswordToggle
            disabled={isRegistering}
          />

          {/* Register button */}
          <button
            type="submit"
            disabled={isRegistering}
            className={`w-full font-bold py-3 rounded-lg shadow-md transition-all transform duration-300 ${
              isRegistering
                ? 'bg-gray-400 cursor-not-allowed'
                : 'cursor-pointer bg-gradient-to-r from-gray-400 via-gray-500 to-gray-700 text-white hover:shadow-xl hover:scale-105 hover:from-gray-500 hover:via-gray-600 hover:to-gray-800'
            }`}
          >
            {isRegistering ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-gray-600 mt-6">
          ¿Ya tenés cuenta?{' '}
          <span
            className="text-gray-800 hover:underline cursor-pointer"
            onClick={() => navigate('/login')}
          >
            Iniciar sesión
          </span>
        </p>
      </div>

      {/* Registration Success Toast */}
      <RegistrationSuccessToast
        isVisible={showSuccessToast}
        onComplete={handleToastComplete}
      />
    </div>
  );
}

export default Register;
