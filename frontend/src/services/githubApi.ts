import axios, { AxiosError } from 'axios';
import { TokenValidation, RepositoryList, ArchiveRequest, ArchiveResponse } from '../types/github';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
});

export const setAuthToken = (token: string) => {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

export const clearAuthToken = () => {
    delete api.defaults.headers.common['Authorization'];
};

export const validateToken = async (token: string): Promise<TokenValidation> => {
    setAuthToken(token);
    try {
        const response = await api.post<TokenValidation>('/validate-token');
        return response.data;
    } catch (error) {
        clearAuthToken();
        if (axios.isAxiosError(error)) {
            // Network error or server not running
            if (!error.response) {
                throw new Error('Unable to connect to server. Please check if the server is running.');
            }
            // Server returned an error response
            if (error.response.status === 401) {
                return { valid: false };
            }
            throw new Error(`Server error: ${error.response.data.detail || 'An unknown error occurred'}`);
        }
        throw new Error('An unexpected error occurred');
    }
};

export const getRepositories = async (
    page: number = 1,
    perPage: number = 30,
    search?: string,
    sort?: string,
    order?: string
): Promise<RepositoryList> => {
    const params = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString(),
        ...(search && { search }),
        ...(sort && { sort }),
        ...(order && { order }),
    });

    const response = await api.get<RepositoryList>(`/repositories?${params}`);
    return response.data;
};

export const archiveRepositories = async (repositoryIds: number[]): Promise<ArchiveResponse> => {
    const request: ArchiveRequest = { repository_ids: repositoryIds };
    const response = await api.post<ArchiveResponse>('/archive', request);
    return response.data;
}; 