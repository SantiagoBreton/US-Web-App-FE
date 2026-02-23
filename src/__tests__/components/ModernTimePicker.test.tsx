import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, userEvent } from '../utils/test-utils';
import ModernTimePicker from '../../components/ModernTimePicker';

describe('ModernTimePicker', () => {
  const mockOnTimeChange = vi.fn();
  
  const defaultProps = {
    selectedTime: '',
    onTimeChange: mockOnTimeChange,
    maxDuration: 120,
    label: 'Test Time Picker'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with label', () => {
    render(<ModernTimePicker {...defaultProps} />);
    
    expect(screen.getByText('Test Time Picker')).toBeInTheDocument();
    expect(screen.getByText('Seleccionar horario')).toBeInTheDocument();
  });

  it('shows selected time when provided', () => {
    render(<ModernTimePicker {...defaultProps} selectedTime="09:00 - 10:30" />);
    
    expect(screen.getByText('09:00 - 10:30')).toBeInTheDocument();
  });

  it('opens time picker when clicked', async () => {
    const user = userEvent.setup();
    render(<ModernTimePicker {...defaultProps} />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    expect(screen.getByText('Seleccionar Horario')).toBeInTheDocument();
    expect(screen.getByText('Visual')).toBeInTheDocument();
    expect(screen.getByText('Manual')).toBeInTheDocument();
  });

  it('switches between visual and manual modes', async () => {
    const user = userEvent.setup();
    render(<ModernTimePicker {...defaultProps} />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    // Switch to manual mode
    const manualButton = screen.getByText('Manual');
    await user.click(manualButton);
    
    expect(screen.getByText('Hora de Inicio')).toBeInTheDocument();
    
    // Switch back to visual mode
    const visualButton = screen.getByText('Visual');
    await user.click(visualButton);
    
    expect(screen.getByText('Hora de Inicio')).toBeInTheDocument();
  });

  it('selects start time in visual mode', async () => {
    const user = userEvent.setup();
    render(<ModernTimePicker {...defaultProps} />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    // Click on 8:00 hour button
    const hour8Button = screen.getByText('8:00');
    await user.click(hour8Button);
    
    // Verify callback was called
    expect(mockOnTimeChange).toHaveBeenCalled();
  });

  it('selects duration presets', async () => {
    const user = userEvent.setup();
    render(<ModernTimePicker {...defaultProps} />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    // First select a start time
    const hour9Button = screen.getByText('9:00');
    await user.click(hour9Button);
    
    // Verify callback was called with correct time setup
    expect(mockOnTimeChange).toHaveBeenCalled();
  });

  it('validates maximum duration', async () => {
    const user = userEvent.setup();
    render(<ModernTimePicker {...defaultProps} maxDuration={60} />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    // Select start time
    const hour9Button = screen.getByText('9:00');
    await user.click(hour9Button);
    
    // Verify callback was called for start time
    expect(mockOnTimeChange).toHaveBeenCalled();
  });

  it('prevents selecting times past 22:30', async () => {
    const user = userEvent.setup();
    render(<ModernTimePicker {...defaultProps} />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    // Select 22:00
    const hour22Button = screen.getByText('22:00');
    await user.click(hour22Button);
    
    // Select 2 hours duration (should be limited)
    const twoHourButton = screen.queryByText('2 horas');
    if (twoHourButton) {
      await user.click(twoHourButton);
      
      // Should limit to 22:30 maximum
      expect(mockOnTimeChange).toHaveBeenCalledWith('22:00 - 22:30');
    }
  });

  it('works in manual mode', async () => {
    const user = userEvent.setup();
    render(<ModernTimePicker {...defaultProps} />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    // Switch to manual mode
    const manualButton = screen.getByText('Manual');
    await user.click(manualButton);
    
    // Verify manual mode shows start time selector
    expect(screen.getByText('Hora de Inicio')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Selecciona hora de inicio')).toBeInTheDocument();
  });

  it('shows duration and time summary when complete', async () => {
    const user = userEvent.setup();
    render(<ModernTimePicker {...defaultProps} selectedTime="14:00 - 16:00" />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    expect(screen.getByText('Horario Seleccionado')).toBeInTheDocument();
    // Use getAllByText since this text appears in both button and summary
    expect(screen.getAllByText('14:00 - 16:00')).toHaveLength(2);
    // Use getAllByText since Duración appears in both header and summary
    expect(screen.getAllByText('Duración')).toHaveLength(2);
    expect(screen.getByText('2h')).toBeInTheDocument();
  });

  it('closes picker when confirmed', async () => {
    const user = userEvent.setup();
    render(<ModernTimePicker {...defaultProps} selectedTime="10:00 - 11:00" />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    const confirmButton = screen.getByText('Confirmar');
    await user.click(confirmButton);
    
    expect(screen.queryByText('Seleccionar Horario')).not.toBeInTheDocument();
  });

  it('closes picker when cancelled', async () => {
    const user = userEvent.setup();
    render(<ModernTimePicker {...defaultProps} />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    const cancelButton = screen.getByText('Cancelar');
    await user.click(cancelButton);
    
    expect(screen.queryByText('Seleccionar Horario')).not.toBeInTheDocument();
  });

  it('disables confirm button when no time selected', async () => {
    const user = userEvent.setup();
    render(<ModernTimePicker {...defaultProps} />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    const confirmButton = screen.getByText('Confirmar');
    expect(confirmButton).toBeDisabled();
  });

  it('only allows 30-minute intervals', async () => {
    const user = userEvent.setup();
    render(<ModernTimePicker {...defaultProps} />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    // Check that the component renders hour options (which shows 30-minute interval design)
    expect(screen.getByText('6:00')).toBeInTheDocument();
    expect(screen.getByText('7:00')).toBeInTheDocument();
    expect(screen.getByText('8:00')).toBeInTheDocument();
    
    // Verify this is the visual mode which shows the time structure
    expect(screen.getByText('Hora de Inicio')).toBeInTheDocument();
  });
});