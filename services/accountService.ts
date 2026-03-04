import { supabase } from '../supabaseClient';

const getAccessToken = async (): Promise<string> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('Sesion no valida. Vuelve a iniciar sesion.');
  }

  return session.access_token;
};

const extractErrorMessage = async (response: Response, fallback: string): Promise<string> => {
  try {
    const data = await response.json();
    if (typeof data?.message === 'string' && data.message.trim()) {
      return data.message;
    }
  } catch {
    // Ignore JSON parse errors
  }

  return fallback;
};

const getFileNameFromDisposition = (headerValue: string | null): string => {
  if (!headerValue) return `sanarte-data-${new Date().toISOString().slice(0, 10)}.json`;

  const match = headerValue.match(/filename="?([^";]+)"?/i);
  if (!match?.[1]) return `sanarte-data-${new Date().toISOString().slice(0, 10)}.json`;
  return match[1];
};

export const accountService = {
  downloadMyDataExport: async (): Promise<void> => {
    const accessToken = await getAccessToken();

    const response = await fetch('/api/account-export', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      const message = await extractErrorMessage(response, 'No pudimos generar tu exportacion de datos.');
      throw new Error(message);
    }

    const blob = await response.blob();
    const filename = getFileNameFromDisposition(response.headers.get('content-disposition'));

    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(blobUrl);
  },

  deleteMyAccount: async (): Promise<void> => {
    const accessToken = await getAccessToken();

    const response = await fetch('/api/account-delete', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify({ confirmPhrase: 'DELETE_MY_ACCOUNT' })
    });

    if (!response.ok) {
      const message = await extractErrorMessage(response, 'No pudimos eliminar tu cuenta.');
      throw new Error(message);
    }
  }
};
