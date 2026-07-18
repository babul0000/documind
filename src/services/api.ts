const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Reads cookie values on the client side.
 */
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

/**
 * Creates dynamic headers containing the Better Auth session token.
 * (Used as a fallback helper for cases where cookies are disabled or read directly).
 */
const getHeaders = (isMultipart: boolean = false): HeadersInit => {
  const headers: Record<string, string> = {};
  
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  
  if (typeof window !== 'undefined') {
    const token = getCookie("better-auth.session_token");
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
};

/**
 * Handles API fetch responses, extracting errors gracefully.
 */
const handleResponse = async (res: Response) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'API request failed.');
  }
  return data;
};

export const api = {
  async get<T>(endpoint: string): Promise<T> {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: getHeaders(),
      // Send HttpOnly cookies automatically with cross-origin requests
      credentials: 'include',
    });
    return handleResponse(res);
  },

  async post<T>(endpoint: string, body: any): Promise<T> {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
      credentials: 'include',
    });
    return handleResponse(res);
  },

  async put<T>(endpoint: string, body: any): Promise<T> {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(body),
      credentials: 'include',
    });
    return handleResponse(res);
  },

  async upload<T>(endpoint: string, formData: FormData): Promise<T> {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(true),
      body: formData,
      credentials: 'include',
    });
    return handleResponse(res);
  },

  uploadWithProgress<T>(endpoint: string, formData: FormData, onProgress: (percent: number) => void): Promise<T> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${BASE_URL}${endpoint}`);
      
      const token = getCookie("better-auth.session_token");
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }
      
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText));
          } catch (e) {
            resolve(xhr.responseText as any);
          }
        } else {
          try {
            const err = JSON.parse(xhr.responseText);
            reject(new Error(err.error || 'Upload failed'));
          } catch {
            reject(new Error('Upload failed'));
          }
        }
      };

      xhr.onerror = () => reject(new Error('Network error'));
      xhr.send(formData);
    });
  },

  async delete<T>(endpoint: string): Promise<T> {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders(),
      credentials: 'include',
    });
    return handleResponse(res);
  },
};
export default api;
