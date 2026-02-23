import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ChangePasswordModal from '../../components/ChangePasswordModal';

describe('ChangePasswordModal', () => {
  const mockProps = {
    isVisible: true,
    onClose: vi.fn(),
    onSave: vi.fn()
  };

  it('should toggle password visibility for all password fields', () => {
    render(<ChangePasswordModal {...mockProps} />);

    // Get all password inputs
    const currentPasswordInput = screen.getByPlaceholderText('Contraseña actual');
    const newPasswordInput = screen.getByPlaceholderText('Nueva contraseña');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirmar nueva contraseña');

    // Initially all should be password type
    expect(currentPasswordInput).toHaveAttribute('type', 'password');
    expect(newPasswordInput).toHaveAttribute('type', 'password');
    expect(confirmPasswordInput).toHaveAttribute('type', 'password');

    // Get all toggle buttons (should be 3)
    const toggleButtons = screen.getAllByRole('button').filter(button => 
      button.getAttribute('aria-label')?.includes('contraseña')
    );
    expect(toggleButtons).toHaveLength(3);

    // Test current password toggle
    fireEvent.click(toggleButtons[0]);
    expect(currentPasswordInput).toHaveAttribute('type', 'text');

    // Test new password toggle
    fireEvent.click(toggleButtons[1]);
    expect(newPasswordInput).toHaveAttribute('type', 'text');

    // Test confirm password toggle
    fireEvent.click(toggleButtons[2]);
    expect(confirmPasswordInput).toHaveAttribute('type', 'text');

    // Toggle back
    fireEvent.click(toggleButtons[0]);
    expect(currentPasswordInput).toHaveAttribute('type', 'password');
  });

  it('should show password requirements when new password input is focused', () => {
    render(<ChangePasswordModal {...mockProps} />);

    const newPasswordInput = screen.getByPlaceholderText('Nueva contraseña');
    
    // Focus the input
    fireEvent.focus(newPasswordInput);
    
    // Check if requirements are shown
    expect(screen.getByText('La contraseña debe tener:')).toBeInTheDocument();
    expect(screen.getByText('Al menos 6 caracteres')).toBeInTheDocument();
    expect(screen.getByText('Al menos una letra mayúscula')).toBeInTheDocument();
    expect(screen.getByText('Al menos un número')).toBeInTheDocument();
  });
});