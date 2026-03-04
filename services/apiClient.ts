import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { logger } from '../utils/logger';

// Configuration interface for the API client
interface ApiClientConfig {
    baseURL?: string;
    headers?: Record<string, string>;
    timeout?: number;
}

class ApiService {
    private client: AxiosInstance;

    constructor(config: ApiClientConfig = {}) {
        this.client = axios.create({
            baseURL: config.baseURL || import.meta.env.VITE_API_URL || '', // Default to environment variable
            timeout: config.timeout || 10000,
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                ...config.headers,
            },
        });

        // Request Interceptor
        this.client.interceptors.request.use(
            (config) => {
                // You can add auth tokens here if needed
                // const token = localStorage.getItem('token');
                // if (token) {
                //   config.headers.Authorization = `Bearer ${token}`;
                // }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Response Interceptor
        this.client.interceptors.response.use(
            (response) => response,
            (error) => {
                // Handle common errors (401, 403, 500)
                if (error.response) {
                    logger.error(`API Error: ${error.response.status} - ${error.response.data?.message || 'Unknown error'}`);
                } else {
                    logger.error('Network Error:', error.message);
                }
                return Promise.reject(error);
            }
        );
    }

    // Generic request wrappers
    public get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        return this.client.get<T>(url, config);
    }

    public post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        return this.client.post<T>(url, data, config);
    }

    public put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        return this.client.put<T>(url, data, config);
    }

    public delete<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        return this.client.delete<T>(url, config);
    }
}

// Export a singleton instance
export const apiClient = new ApiService();
