export interface Repository {
    id: number;
    name: string;
    full_name: string;
    description?: string;
    archived: boolean;
    updated_at: string;
    stars: number;
    language?: string;
}

export interface RepositoryList {
    repositories: Repository[];
    total_count: number;
    current_page: number;
    total_pages: number;
}

export interface TokenValidation {
    valid: boolean;
    username?: string;
}

export interface ArchiveRequest {
    repository_ids: number[];
}

export interface FailedRepository {
    id: number;
    name: string;
    error: string;
}

export interface ArchiveResponse {
    success: boolean;
    archived_count: number;
    failed_repositories: FailedRepository[];
} 