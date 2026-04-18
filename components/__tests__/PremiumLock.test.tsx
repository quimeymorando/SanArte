import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PremiumLock } from '../PremiumLock';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const renderLock = (props: Partial<React.ComponentProps<typeof PremiumLock>> = {}) => {
  const defaults = {
    isLocked: true,
    title: 'Función Premium',
    description: 'Desbloquea para acceder',
    children: <div data-testid="child-content">Contenido protegido</div>,
  };
  return render(
    <MemoryRouter>
      <PremiumLock {...defaults} {...props} />
    </MemoryRouter>
  );
};

describe('PremiumLock', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('cuando isLocked es false', () => {
    it('renderiza los children directamente sin overlay', () => {
      renderLock({ isLocked: false });
      expect(screen.getByTestId('child-content')).toBeInTheDocument();
      expect(screen.queryByText('Desbloquear')).not.toBeInTheDocument();
    });
  });

  describe('cuando isLocked es true', () => {
    it('muestra el título y la descripción en el overlay', () => {
      renderLock();
      expect(screen.getByText('Función Premium')).toBeInTheDocument();
      expect(screen.getByText('Desbloquea para acceder')).toBeInTheDocument();
    });

    it('muestra el botón "Desbloquear"', () => {
      renderLock();
      expect(screen.getByRole('button', { name: /desbloquear/i })).toBeInTheDocument();
    });

    it('navega a /profile?upgrade=true al presionar Desbloquear', () => {
      renderLock();
      fireEvent.click(screen.getByRole('button', { name: /desbloquear/i }));
      expect(mockNavigate).toHaveBeenCalledWith('/profile?upgrade=true');
    });

    it('muestra el badge de Contenido Exclusivo', () => {
      renderLock();
      expect(screen.getByText('Contenido Exclusivo')).toBeInTheDocument();
    });

    it('renderiza los children (con blur) para mantener el layout', () => {
      renderLock();
      expect(screen.getByTestId('child-content')).toBeInTheDocument();
    });
  });
});
