import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, userEvent } from '../utils/test-utils';
import ModernDatePicker from '../../components/ModernDatePicker';

describe('ModernDatePicker', () => {
  const mockOnDateChange = vi.fn();
  
  const defaultProps = {
    selectedDate: '',
    onDateChange: mockOnDateChange,
    label: 'Test Date Picker'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with label', () => {
    render(<ModernDatePicker {...defaultProps} />);
    
    expect(screen.getByText('Test Date Picker')).toBeInTheDocument();
    expect(screen.getByText('Seleccionar fecha')).toBeInTheDocument();
  });

  it('shows selected date when provided', () => {
    render(<ModernDatePicker {...defaultProps} selectedDate="2025-09-15" />);
    
    expect(screen.getByText(/lunes.*15.*septiembre.*2025/i)).toBeInTheDocument();
  });

  it('opens calendar when clicked', async () => {
    const user = userEvent.setup();
    render(<ModernDatePicker {...defaultProps} />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    expect(screen.getByText('Septiembre 2025')).toBeInTheDocument();
    expect(screen.getByText('Dom')).toBeInTheDocument();
    expect(screen.getByText('Lun')).toBeInTheDocument();
  });

  it('navigates between months', async () => {
    const user = userEvent.setup();
    render(<ModernDatePicker {...defaultProps} />);
    
    // Open calendar
    const button = screen.getByRole('button');
    await user.click(button);
    
    // Click next month
    const nextMonthButton = screen.getByTitle('Mes siguiente');
    await user.click(nextMonthButton);
    
    expect(screen.getByText('Octubre 2025')).toBeInTheDocument();
    
    // Click previous month twice to go back to August
    const prevMonthButton = screen.getByTitle('Mes anterior');
    await user.click(prevMonthButton);
    await user.click(prevMonthButton);
    
    expect(screen.getByText('Agosto 2025')).toBeInTheDocument();
  });

  it('navigates between years', async () => {
    const user = userEvent.setup();
    render(<ModernDatePicker {...defaultProps} />);
    
    // Open calendar
    const button = screen.getByRole('button');
    await user.click(button);
    
    // Click next year
    const nextYearButton = screen.getByTitle('Año siguiente');
    await user.click(nextYearButton);
    
    expect(screen.getByText('Septiembre 2026')).toBeInTheDocument();
    
    // Click previous year twice
    const prevYearButton = screen.getByTitle('Año anterior');
    await user.click(prevYearButton);
    await user.click(prevYearButton);
    
    expect(screen.getByText('Septiembre 2024')).toBeInTheDocument();
  });

  it('selects a date', async () => {
    const user = userEvent.setup();
    render(<ModernDatePicker {...defaultProps} />);
    
    // Open calendar
    const button = screen.getByRole('button');
    await user.click(button);
    
    // Click on day 15
    const day15 = screen.getByRole('button', { name: '15' });
    await user.click(day15);
    
    expect(mockOnDateChange).toHaveBeenCalledWith('2025-09-15');
  });

  it('uses quick action buttons', async () => {
    const user = userEvent.setup();
    render(<ModernDatePicker {...defaultProps} />);
    
    // Open calendar
    const button = screen.getByRole('button');
    await user.click(button);
    
    // Click "Hoy" button
    const todayButton = screen.getByText('Hoy');
    await user.click(todayButton);
    
    const today = new Date().toISOString().split('T')[0];
    expect(mockOnDateChange).toHaveBeenCalledWith(today);
  });

  it('closes calendar when backdrop is clicked', async () => {
    const user = userEvent.setup();
    render(<ModernDatePicker {...defaultProps} />);
    
    // Open calendar
    const button = screen.getByRole('button');
    await user.click(button);
    
    expect(screen.getByText('Septiembre 2025')).toBeInTheDocument();
    
    // Click backdrop (fixed div)
    const backdrop = document.querySelector('.fixed.inset-0.z-40');
    if (backdrop) {
      await user.click(backdrop);
      expect(screen.queryByText('Septiembre 2025')).not.toBeInTheDocument();
    }
  });

  it('disables dates before minDate', async () => {
    const user = userEvent.setup();
    render(
      <ModernDatePicker 
        {...defaultProps} 
        minDate="2025-09-15"
      />
    );
    
    // Open calendar
    const button = screen.getByRole('button');
    await user.click(button);
    
    // Day 10 should be disabled (before minDate)
    const day10Buttons = screen.getAllByRole('button', { name: '10' });
    const day10 = day10Buttons.find(btn => (btn as HTMLButtonElement).disabled);
    expect(day10).toBeDefined();
    expect(day10).toBeDisabled();
    
    // Day 20 should be enabled (after minDate)
    const day20 = screen.getByRole('button', { name: '20' });
    expect(day20).toBeEnabled();
  });

  it('disables dates after maxDate', async () => {
    const user = userEvent.setup();
    render(
      <ModernDatePicker 
        {...defaultProps} 
        maxDate="2025-09-20"
      />
    );
    
    // Open calendar
    const button = screen.getByRole('button');
    await user.click(button);
    
    // Day 15 should be enabled (before maxDate)
    const day15 = screen.getByRole('button', { name: '15' });
    expect(day15).toBeEnabled();
    
    // Day 25 should be disabled (after maxDate)
    const day25 = screen.getByRole('button', { name: '25' });
    expect(day25).toBeDisabled();
  });

});