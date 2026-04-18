import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import UpgradePage from '../UpgradePage';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../../services/monetizationService', () => ({
  trackMonetizationEvent: vi.fn(),
}));

const renderPage = () =>
  render(
    <MemoryRouter>
      <UpgradePage />
    </MemoryRouter>
  );

describe('UpgradePage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    vi.spyOn(window, 'open').mockImplementation(() => null);
  });

  describe('estructura de la página', () => {
    it('muestra los 3 tiers de precios: Buscador, Sanador, Mecenas', () => {
      renderPage();
      expect(screen.getByText('Buscador')).toBeInTheDocument();
      expect(screen.getByText('Sanador')).toBeInTheDocument();
      expect(screen.getByText('Mecenas')).toBeInTheDocument();
    });

    it('muestra el badge "Más Popular" en el tier Sanador', () => {
      renderPage();
      expect(screen.getByText('Más Popular')).toBeInTheDocument();
    });

    it('muestra "7 días gratis" en el tier premium', () => {
      renderPage();
      expect(screen.getByText('7 días gratis')).toBeInTheDocument();
    });

    it('renderiza el toggle de ciclo de facturación (Mensual / Anual)', () => {
      renderPage();
      expect(screen.getByRole('button', { name: /mensual/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /anual/i })).toBeInTheDocument();
    });

    it('muestra el botón Volver', () => {
      renderPage();
      expect(screen.getByRole('button', { name: /volver/i })).toBeInTheDocument();
    });
  });

  describe('tracking de eventos', () => {
    it('trackea paywall_view al montar la página', async () => {
      const { trackMonetizationEvent } = await import('../../services/monetizationService');
      renderPage();
      expect(trackMonetizationEvent).toHaveBeenCalledWith('paywall_view', { source: 'upgrade_page' });
    });
  });

  describe('ciclo de facturación', () => {
    it('muestra precio mensual $3 por defecto', () => {
      renderPage();
      expect(screen.getByText('$3')).toBeInTheDocument();
    });

    it('cambia al precio anual al clickear Anual (si está habilitado)', () => {
      // Si annual URL no está configurado, el botón está deshabilitado
      renderPage();
      const anualBtn = screen.getByRole('button', { name: /anual/i });
      // En entorno de test, VITE_LS_CHECKOUT_ANNUAL es vacío → botón deshabilitado
      expect(anualBtn).toBeDisabled();
    });
  });

  describe('checkout — URL mensual configurada', () => {
    it('abre la URL de checkout en nueva pestaña', () => {
      renderPage();
      fireEvent.click(screen.getByRole('button', { name: /prueba 7 días gratis/i }));
      // La URL mensual fallback está hardcodeada, es válida
      expect(window.open).toHaveBeenCalledWith(
        expect.stringContaining('lemonsqueezy.com/checkout/buy/'),
        '_blank',
        'noopener,noreferrer'
      );
    });

    it('trackea checkout_click con billing_cycle: monthly', async () => {
      const { trackMonetizationEvent } = await import('../../services/monetizationService');
      renderPage();
      fireEvent.click(screen.getByRole('button', { name: /prueba 7 días gratis/i }));
      expect(trackMonetizationEvent).toHaveBeenCalledWith('checkout_click', {
        source: 'upgrade_page',
        billing_cycle: 'monthly',
      });
    });
  });

  describe('checkout — URL no configurada', () => {
    it('el botón Mecenas está deshabilitado cuando la URL no está configurada', () => {
      renderPage();
      // VITE_LS_CHECKOUT_MECENAS no está configurado en test → botón disabled
      expect(screen.getByRole('button', { name: /hacer donación/i })).toBeDisabled();
    });
  });

  describe('isValidCheckout', () => {
    it('La URL mensual hardcodeada pasa la validación regex', () => {
      renderPage();
      // Si el botón de subscribe funciona (abre URL), la URL es válida
      fireEvent.click(screen.getByRole('button', { name: /prueba 7 días gratis/i }));
      expect(window.open).toHaveBeenCalled();
      expect(window.alert).not.toHaveBeenCalled();
    });
  });

  describe('navegación', () => {
    it('navega hacia atrás al presionar Volver', () => {
      renderPage();
      fireEvent.click(screen.getByRole('button', { name: /volver/i }));
      expect(mockNavigate).toHaveBeenCalledWith(-1);
    });

    it('navega a /terms al clickear "Términos de Servicio"', () => {
      renderPage();
      fireEvent.click(screen.getByText('Términos de Servicio'));
      expect(mockNavigate).toHaveBeenCalledWith('/terms');
    });
  });
});
