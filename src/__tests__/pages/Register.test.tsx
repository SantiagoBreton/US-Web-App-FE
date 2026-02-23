import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, userEvent, waitFor } from '../utils/test-utils';
import Register from '../../pages/Register';
import { register } from '../../api_calls/auth';

// Mock the API calls
vi.mock('../../api_calls/auth', () => ({
  register: vi.fn()
}));

vi.mock('../../api_calls/get_apartments', () => ({
  getApartments: vi.fn().mockResolvedValue([
    { id: '1', unit: 'Apartment 1', floor: 1, occupant: null },
    { id: '1A', unit: 'Apartment 1A', floor: 1, occupant: null },
    { id: '2', unit: 'Apartment 2', floor: 2, occupant: null }
  ])
}));

// Mock react-router-dom with importOriginal to preserve MemoryRouter
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Register Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders register form correctly', () => {
    render(<Register />);
    
    expect(screen.getByText('Crear cuenta')).toBeInTheDocument();
    expect(screen.getByText('Registrate para gestionar tu consorcio')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Nombre completo')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Correo electrónico')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Contraseña')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Confirmar contraseña')).toBeInTheDocument();
    expect(screen.getByText('Registrarse')).toBeInTheDocument();
    expect(screen.getByText('¿Ya tenés cuenta?')).toBeInTheDocument();
    expect(screen.getByText('Iniciar sesión')).toBeInTheDocument();
  });

  it('renders logo image', () => {
    render(<Register />);
    
    const logo = screen.getByAltText('Logo US');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', expect.stringContaining('Logo_Us_2'));
  });

  it('handles successful registration', async () => {
    const user = userEvent.setup();
    (register as any).mockResolvedValue({ success: true });
    
    render(<Register />);
    
    const nameInput = screen.getByPlaceholderText('Nombre completo');
    const emailInput = screen.getByPlaceholderText('Correo electrónico');
    const apartmentSelect = screen.getByDisplayValue('Selecciona un apartamento');
    const passwordInput = screen.getByPlaceholderText('Contraseña');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirmar contraseña');
    const submitButton = screen.getByText('Registrarse');
    
    await user.type(nameInput, 'John Doe');
    await user.type(emailInput, 'john@example.com');
    // Select an apartment to satisfy validation
    await user.selectOptions(apartmentSelect, '1');
    await user.type(passwordInput, 'Password123');
    await user.type(confirmPasswordInput, 'Password123');
    await user.click(submitButton);
    
    expect(register).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'Password123',
      apartmentId: '1'
    });
    
    // Wait longer for the toast to complete (2000ms) and navigation to happen
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    }, { timeout: 3000 });
  });

  it('handles registration failure', async () => {
    const user = userEvent.setup();
    (register as any).mockResolvedValue({ 
      success: false, 
      message: 'Email already exists' 
    });
    
    render(<Register />);
    
    const nameInput = screen.getByPlaceholderText('Nombre completo');
    const emailInput = screen.getByPlaceholderText('Correo electrónico');
    const apartmentSelect = screen.getByDisplayValue('Selecciona un apartamento');
    const passwordInput = screen.getByPlaceholderText('Contraseña');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirmar contraseña');
    const submitButton = screen.getByText('Registrarse');
    
    await user.type(nameInput, 'John Doe');
    await user.type(emailInput, 'existing@example.com');
    // Select an apartment to satisfy validation
    await user.selectOptions(apartmentSelect, '1A');
    await user.type(passwordInput, 'Password123');
    await user.type(confirmPasswordInput, 'Password123');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Email already exists')).toBeInTheDocument();
    });
    
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    render(<Register />);
    
    const submitButton = screen.getByText('Registrarse');
    await user.click(submitButton);
    
    expect(screen.getByText('El nombre es obligatorio')).toBeInTheDocument();
    expect(screen.getByText('El correo es obligatorio')).toBeInTheDocument();
    expect(screen.getByText('La contraseña es obligatoria')).toBeInTheDocument();
    
    expect(register).not.toHaveBeenCalled();
  });

  it('validates password length', async () => {
    const user = userEvent.setup();
    render(<Register />);
    
    const nameInput = screen.getByPlaceholderText('Nombre completo');
    const emailInput = screen.getByPlaceholderText('Correo electrónico');
    const passwordInput = screen.getByPlaceholderText('Contraseña');
    const submitButton = screen.getByText('Registrarse');
    
    await user.type(nameInput, 'John Doe');
    await user.type(emailInput, 'john@example.com');
    await user.type(passwordInput, '12345'); // Less than 6 characters
    await user.click(submitButton);
    
    expect(screen.getByText('La contraseña debe tener al menos 6 caracteres')).toBeInTheDocument();
    expect(register).not.toHaveBeenCalled();
  });

  it('validates password uppercase requirement', async () => {
    const user = userEvent.setup();
    render(<Register />);
    
    const nameInput = screen.getByPlaceholderText('Nombre completo');
    const emailInput = screen.getByPlaceholderText('Correo electrónico');
    const passwordInput = screen.getByPlaceholderText('Contraseña');
    const submitButton = screen.getByText('Registrarse');
    
    await user.type(nameInput, 'John Doe');
    await user.type(emailInput, 'john@example.com');
    await user.type(passwordInput, 'password123'); // No uppercase
    await user.click(submitButton);
    
    expect(screen.getByText('La contraseña debe tener al menos una letra mayúscula')).toBeInTheDocument();
    expect(register).not.toHaveBeenCalled();
  });

  it('validates password number requirement', async () => {
    const user = userEvent.setup();
    render(<Register />);
    
    const nameInput = screen.getByPlaceholderText('Nombre completo');
    const emailInput = screen.getByPlaceholderText('Correo electrónico');
    const passwordInput = screen.getByPlaceholderText('Contraseña');
    const submitButton = screen.getByText('Registrarse');
    
    await user.type(nameInput, 'John Doe');
    await user.type(emailInput, 'john@example.com');
    await user.type(passwordInput, 'Password'); // No number
    await user.click(submitButton);
    
    expect(screen.getByText('La contraseña debe tener al menos un número')).toBeInTheDocument();
    expect(register).not.toHaveBeenCalled();
  });

  it('validates password confirmation match', async () => {
    const user = userEvent.setup();
    render(<Register />);
    
    const nameInput = screen.getByPlaceholderText('Nombre completo');
    const emailInput = screen.getByPlaceholderText('Correo electrónico');
    const passwordInput = screen.getByPlaceholderText('Contraseña');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirmar contraseña');
    const submitButton = screen.getByText('Registrarse');
    
    await user.type(nameInput, 'John Doe');
    await user.type(emailInput, 'john@example.com');
    await user.type(passwordInput, 'Password123');
    await user.type(confirmPasswordInput, 'Password456'); // Different password
    await user.click(submitButton);
    
    const errorMessages = screen.getAllByText('Las contraseñas no coinciden');
    expect(errorMessages).toHaveLength(2); // One for each password field
    expect(register).not.toHaveBeenCalled();
  });

  it('shows password requirements when password field is focused', async () => {
    const user = userEvent.setup();
    render(<Register />);
    
    const passwordInput = screen.getByPlaceholderText('Contraseña');
    
    // Initially requirements should not be visible
    expect(screen.queryByText('La contraseña debe tener:')).not.toBeInTheDocument();
    
    // Focus on password field
    await user.click(passwordInput);
    
    expect(screen.getByText('La contraseña debe tener:')).toBeInTheDocument();
    expect(screen.getByText('Al menos 6 caracteres')).toBeInTheDocument();
    expect(screen.getByText('Al menos una letra mayúscula')).toBeInTheDocument();
    expect(screen.getByText('Al menos un número')).toBeInTheDocument();
  });

  it('navigates to login page when login link is clicked', async () => {
    const user = userEvent.setup();
    render(<Register />);
    
    const loginLink = screen.getByText('Iniciar sesión');
    await user.click(loginLink);
    
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('updates input values when typing', async () => {
    const user = userEvent.setup();
    render(<Register />);
    
    const nameInput = screen.getByPlaceholderText('Nombre completo');
    const emailInput = screen.getByPlaceholderText('Correo electrónico');
    const passwordInput = screen.getByPlaceholderText('Contraseña');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirmar contraseña');
    
    await user.type(nameInput, 'Jane Smith');
    await user.type(emailInput, 'jane@test.com');
    await user.type(passwordInput, 'MyPassword123');
    await user.type(confirmPasswordInput, 'MyPassword123');
    
    expect(nameInput).toHaveValue('Jane Smith');
    expect(emailInput).toHaveValue('jane@test.com');
    expect(passwordInput).toHaveValue('MyPassword123');
    expect(confirmPasswordInput).toHaveValue('MyPassword123');
  });

  it('has correct input types', () => {
    render(<Register />);
    
    const nameInput = screen.getByPlaceholderText('Nombre completo');
    const emailInput = screen.getByPlaceholderText('Correo electrónico');
    const passwordInput = screen.getByPlaceholderText('Contraseña');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirmar contraseña');
    
    expect(nameInput).toHaveAttribute('type', 'text');
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(confirmPasswordInput).toHaveAttribute('type', 'password');
  });

});