import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Checkbox,
    Button,
    TextField,
    Typography,
    Alert,
    IconButton,
    Chip,
    Stack,
    Skeleton,
    LinearProgress,
} from '@mui/material';
import {
    Search as SearchIcon,
    Archive as ArchiveIcon,
    Star as StarIcon,
    Code as CodeIcon,
} from '@mui/icons-material';
import { getRepositories, archiveRepositories } from '../services/githubApi';
import { Repository } from '../types/github';

interface RepositoryListProps {
    onLogout: () => void;
}

export const RepositoryList: React.FC<RepositoryListProps> = ({ onLogout }) => {
    const [repositories, setRepositories] = useState<Repository[]>([]);
    const [selected, setSelected] = useState<number[]>([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(100);
    const [totalCount, setTotalCount] = useState(0);
    const [search, setSearch] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [archiving, setArchiving] = useState(false);

    const fetchRepositories = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await getRepositories(page + 1, rowsPerPage, searchQuery);
            setRepositories(result.repositories);
            setTotalCount(result.total_count);
        } catch (err) {
            setError('Failed to fetch repositories');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRepositories();
    }, [page, rowsPerPage, searchQuery]);

    const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            const newSelected = repositories
                .filter(repo => !repo.archived)
                .map(repo => repo.id);
            setSelected(newSelected);
            return;
        }
        setSelected([]);
    };

    const handleSelect = (id: number) => {
        const selectedIndex = selected.indexOf(id);
        let newSelected: number[] = [];

        if (selectedIndex === -1) {
            newSelected = [...selected, id];
        } else {
            newSelected = selected.filter(item => item !== id);
        }

        setSelected(newSelected);
    };

    const handleArchiveSelected = async () => {
        setArchiving(true);
        setError(null);
        try {
            const result = await archiveRepositories(selected);
            if (result.success) {
                await fetchRepositories();
                setSelected([]);
            } else {
                setError(`Failed to archive ${result.failed_repositories.length} repositories`);
            }
        } catch (err) {
            setError('Failed to archive repositories');
        } finally {
            setArchiving(false);
        }
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        if (value !== search) {
            setSearch(value);
        }
    };

    const handleSearchSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        const trimmedSearch = search.trim();
        if (trimmedSearch !== searchQuery) {
            setSearchQuery(trimmedSearch);
            setPage(0);
        }
    };

    const handleClearSearch = () => {
        setSearch('');
        setSearchQuery('');
        setPage(0);
    };

    const LoadingRows = () => (
        <>
            {[...Array(Math.min(10, rowsPerPage))].map((_, index) => (
                <TableRow key={index}>
                    <TableCell padding="checkbox">
                        <Skeleton variant="rectangular" width={20} height={20} />
                    </TableCell>
                    <TableCell>
                        <Box>
                            <Skeleton variant="text" width={200} />
                            <Skeleton variant="text" width={300} />
                        </Box>
                    </TableCell>
                    <TableCell>
                        <Skeleton variant="text" width={100} />
                    </TableCell>
                    <TableCell align="right">
                        <Skeleton variant="text" width={50} />
                    </TableCell>
                    <TableCell>
                        <Skeleton variant="text" width={80} />
                    </TableCell>
                </TableRow>
            ))}
        </>
    );

    return (
        <Box sx={{ p: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5" component="h1">
                    Your Repositories
                </Typography>
                <Button variant="outlined" color="primary" onClick={onLogout}>
                    Logout
                </Button>
            </Stack>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Paper sx={{ width: '100%', mb: 2, position: 'relative' }}>
                {loading && (
                    <LinearProgress sx={{ position: 'absolute', top: 0, left: 0, right: 0 }} />
                )}

                <Box
                    component="form"
                    onSubmit={handleSearchSubmit}
                    sx={{ p: 2, display: 'flex', gap: 2 }}
                >
                    <TextField
                        placeholder="Search repositories..."
                        value={search}
                        onChange={handleSearchChange}
                        variant="outlined"
                        size="small"
                        InputProps={{
                            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                        }}
                        sx={{ flexGrow: 1 }}
                        disabled={loading}
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={loading || !search.trim()}
                    >
                        Search
                    </Button>
                    {searchQuery && (
                        <Button
                            variant="outlined"
                            onClick={handleClearSearch}
                            disabled={loading}
                        >
                            Clear
                        </Button>
                    )}
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<ArchiveIcon />}
                        disabled={selected.length === 0 || archiving}
                        onClick={handleArchiveSelected}
                    >
                        {archiving ? 'Archiving...' : `Archive Selected (${selected.length})`}
                    </Button>
                </Box>

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        indeterminate={selected.length > 0 && selected.length < repositories.filter(repo => !repo.archived).length}
                                        checked={selected.length === repositories.filter(repo => !repo.archived).length}
                                        onChange={handleSelectAll}
                                        disabled={loading}
                                    />
                                </TableCell>
                                <TableCell>Repository</TableCell>
                                <TableCell>Language</TableCell>
                                <TableCell align="right">Stars</TableCell>
                                <TableCell>Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading && repositories.length === 0 ? (
                                <LoadingRows />
                            ) : (
                                repositories.map((repo) => (
                                    <TableRow
                                        key={repo.id}
                                        hover
                                        selected={selected.includes(repo.id)}
                                    >
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                checked={selected.includes(repo.id)}
                                                onChange={() => handleSelect(repo.id)}
                                                disabled={repo.archived}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Box>
                                                <Typography variant="body1">
                                                    {repo.name}
                                                </Typography>
                                                {repo.description && (
                                                    <Typography variant="body2" color="text.secondary">
                                                        {repo.description}
                                                    </Typography>
                                                )}
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            {repo.language && (
                                                <Chip
                                                    icon={<CodeIcon />}
                                                    label={repo.language}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            )}
                                        </TableCell>
                                        <TableCell align="right">
                                            <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={0.5}>
                                                <StarIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                                <Typography>{repo.stars}</Typography>
                                            </Stack>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={repo.archived ? 'Archived' : 'Active'}
                                                color={repo.archived ? 'default' : 'success'}
                                                size="small"
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                            {!loading && repositories.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        <Typography color="text.secondary">
                                            No repositories found
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    rowsPerPageOptions={[100]}
                    component="div"
                    count={totalCount}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(_, newPage) => setPage(newPage)}
                    onRowsPerPageChange={(event) => {
                        setRowsPerPage(parseInt(event.target.value, 10));
                        setPage(0);
                    }}
                    disabled={loading}
                />
            </Paper>
        </Box>
    );
}; 