import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, userEvent, waitFor } from '../utils/test-utils';
import Login from '../../pages/Login';
import { login } from '../../api_calls/auth';
import { forgotPassword } from '../../api_calls/forgot_password';

// Mock the API calls
vi.mock('../../api_calls/auth', () => ({
  login: vi.fn()
}));

vi.mock('../../api_calls/forgot_password', () => ({
  forgotPassword: vi.fn()
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal() as any;
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

// Mock ForgotPasswordModal component
vi.mock('../../components/ForgotPasswordModal', () => ({
  default: ({ isVisible, onClose, onSendEmail }: any) => 
    isVisible ? (
      <div data-testid="forgot-password-modal">
        <h2>Forgot Password Modal</h2>
        <button onClick={() => onSendEmail('test@example.com')}>Send Email</button>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null
}));

describe('Login Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form correctly', () => {
    render(<Login />);
    
    expect(screen.getByText('Bienvenido a US')).toBeInTheDocument();
    expect(screen.getByText('Iniciá sesión para gestionar tu consorcio')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Correo electrónico')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Contraseña')).toBeInTheDocument();
    expect(screen.getByText('Iniciar sesión')).toBeInTheDocument();
    expect(screen.getByText('¿Olvidaste tu contraseña?')).toBeInTheDocument();
    expect(screen.getByText('¿No tenés cuenta?')).toBeInTheDocument();
    expect(screen.getByText('Registrate')).toBeInTheDocument();
  });

  it('renders logo image', () => {
    render(<Login />);
    
    const logo = screen.getByAltText('Logo US');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', expect.stringContaining('Logo_Us_2'));
  });

  it('handles successful login', async () => {
    const user = userEvent.setup();
    (login as any).mockResolvedValue({ success: true });
    
    render(<Login />);
    
    const emailInput = screen.getByPlaceholderText('Correo electrónico');
    const passwordInput = screen.getByPlaceholderText('Contraseña');
    const submitButton = screen.getByText('Iniciar sesión');
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);
    
    expect(login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    });
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('handles login failure', async () => {
    const user = userEvent.setup();
    (login as any).mockResolvedValue({ 
      success: false, 
      message: 'Credenciales inválidas' 
    });
    
    render(<Login />);
    
    const emailInput = screen.getByPlaceholderText('Correo electrónico');
    const passwordInput = screen.getByPlaceholderText('Contraseña');
    const submitButton = screen.getByText('Iniciar sesión');
    
    await user.type(emailInput, 'wrong@example.com');
    await user.type(passwordInput, 'wrongpassword');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Credenciales inválidas')).toBeInTheDocument();
    });
    
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('shows error message when login fails without specific message', async () => {
    const user = userEvent.setup();
    (login as any).mockResolvedValue({ success: false });
    
    render(<Login />);
    
    const emailInput = screen.getByPlaceholderText('Correo electrónico');
    const passwordInput = screen.getByPlaceholderText('Contraseña');
    const submitButton = screen.getByText('Iniciar sesión');
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Error en el inicio de sesión')).toBeInTheDocument();
    });
  });

  it('navigates to register page when register link is clicked', async () => {
    const user = userEvent.setup();
    render(<Login />);
    
    const registerLink = screen.getByText('Registrate');
    await user.click(registerLink);
    
    expect(mockNavigate).toHaveBeenCalledWith('/register');
  });

  it('opens forgot password modal when link is clicked', async () => {
    const user = userEvent.setup();
    render(<Login />);
    
    const forgotPasswordLink = screen.getByText('¿Olvidaste tu contraseña?');
    await user.click(forgotPasswordLink);
    
    expect(screen.getByTestId('forgot-password-modal')).toBeInTheDocument();
    expect(screen.getByText('Forgot Password Modal')).toBeInTheDocument();
  });

  it('closes forgot password modal', async () => {
    const user = userEvent.setup();
    render(<Login />);
    
    // Open modal
    const forgotPasswordLink = screen.getByText('¿Olvidaste tu contraseña?');
    await user.click(forgotPasswordLink);
    
    expect(screen.getByTestId('forgot-password-modal')).toBeInTheDocument();
    
    // Close modal
    const closeButton = screen.getByText('Close');
    await user.click(closeButton);
    
    expect(screen.queryByTestId('forgot-password-modal')).not.toBeInTheDocument();
  });

  it('handles forgot password email submission', async () => {
    const user = userEvent.setup();
    (forgotPassword as any).mockResolvedValue({ success: true });
    
    render(<Login />);
    
    // Open modal
    const forgotPasswordLink = screen.getByText('¿Olvidaste tu contraseña?');
    await user.click(forgotPasswordLink);
    
    // Send email
    const sendEmailButton = screen.getByText('Send Email');
    await user.click(sendEmailButton);
    
    expect(forgotPassword).toHaveBeenCalledWith({ email: 'test@example.com' });
  });

  it('handles form submission with empty fields', async () => {
    const user = userEvent.setup();
    (login as any).mockResolvedValue({ success: false, message: 'Required fields missing' });
    
    render(<Login />);
    
    const submitButton = screen.getByText('Iniciar sesión');
    await user.click(submitButton);
    
    expect(login).toHaveBeenCalledWith({
      email: '',
      password: ''
    });
  });

  it('updates input values when typing', async () => {
    const user = userEvent.setup();
    render(<Login />);
    
    const emailInput = screen.getByPlaceholderText('Correo electrónico');
    const passwordInput = screen.getByPlaceholderText('Contraseña');
    
    await user.type(emailInput, 'user@test.com');
    await user.type(passwordInput, 'mypassword');
    
    expect(emailInput).toHaveValue('user@test.com');
    expect(passwordInput).toHaveValue('mypassword');
  });

  it('has correct input types', () => {
    render(<Login />);
    
    const emailInput = screen.getByPlaceholderText('Correo electrónico');
    const passwordInput = screen.getByPlaceholderText('Contraseña');
    
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('submit button has correct type', () => {
    render(<Login />);
    
    const submitButton = screen.getByText('Iniciar sesión');
    expect(submitButton).toHaveAttribute('type', 'submit');
  });

  it('forgot password button has correct type', () => {
    render(<Login />);
    
    const forgotPasswordButton = screen.getByText('¿Olvidaste tu contraseña?');
    expect(forgotPasswordButton).toHaveAttribute('type', 'button');
  });
});