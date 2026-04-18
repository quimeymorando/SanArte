import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import UpgradeModal from '../UpgradeModal';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const renderModal = (overrides: Partial<{ onClose: () => void; onSuccess: () => void }> = {}) => {
  const props = {
    onClose: vi.fn(),
    onSuccess: vi.fn(),
    ...overrides,
  };
  render(
    <MemoryRouter>
      <UpgradeModal {...props} />
    </MemoryRouter>
  );
  return props;
};

describe('UpgradeModal', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('contenido visible', () => {
    it('muestra el título "El Loto Dorado"', () => {
      renderModal();
      expect(screen.getByText('El Loto Dorado')).toBeInTheDocument();
    });

    it('lista los 3 beneficios premium', () => {
      renderModal();
      expect(screen.getByText('Voz de SanArte')).toBeInTheDocument();
      expect(screen.getByText('Sin Velo Místico')).toBeInTheDocument();
      expect(screen.getByText('Conciencia Infinita')).toBeInTheDocument();
    });

    it('muestra el botón principal "Ver planes premium"', () => {
      renderModal();
      expect(screen.getByRole('button', { name: /ver planes premium/i })).toBeInTheDocument();
    });

    it('muestra el botón de cierre "Tal vez luego"', () => {
      renderModal();
      expect(screen.getByRole('button', { name: /tal vez luego/i })).toBeInTheDocument();
    });
  });

  describe('interacciones del botón de upgrade', () => {
    it('llama a onSuccess al presionar "Ver planes premium"', () => {
      const { onSuccess } = renderModal();
      fireEvent.click(screen.getByRole('button', { name: /ver planes premium/i }));
      expect(onSuccess).toHaveBeenCalledOnce();
    });

    it('llama a onClose al presionar "Ver planes premium"', () => {
      const { onClose } = renderModal();
      fireEvent.click(screen.getByRole('button', { name: /ver planes premium/i }));
      expect(onClose).toHaveBeenCalledOnce();
    });

    it('navega a /upgrade al presionar "Ver planes premium"', () => {
      renderModal();
      fireEvent.click(screen.getByRole('button', { name: /ver planes premium/i }));
      expect(mockNavigate).toHaveBeenCalledWith('/upgrade');
    });
  });

  describe('cierre del modal', () => {
    it('llama a onClose al presionar "Tal vez luego"', () => {
      const { onClose } = renderModal();
      fireEvent.click(screen.getByRole('button', { name: /tal vez luego/i }));
      expect(onClose).toHaveBeenCalledOnce();
    });

    it('llama a onClose al hacer click en el overlay', () => {
      const { onClose } = renderModal();
      // El backdrop es el div con bg-black/60
      const backdrop = document.querySelector('.bg-black\\/60') as HTMLElement;
      fireEvent.click(backdrop);
      expect(onClose).toHaveBeenCalledOnce();
    });

    it('"Tal vez luego" no navega a /upgrade', () => {
      renderModal();
      fireEvent.click(screen.getByRole('button', { name: /tal vez luego/i }));
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});
