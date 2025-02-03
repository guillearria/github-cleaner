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
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [search, setSearch] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [archiving, setArchiving] = useState(false);

    const fetchRepositories = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await getRepositories(page + 1, rowsPerPage, search);
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
    }, [page, rowsPerPage, search]);

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
        setSearch(event.target.value);
        setPage(0);
    };

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

            <Paper sx={{ width: '100%', mb: 2 }}>
                <Box sx={{ p: 2, display: 'flex', gap: 2 }}>
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
                    />
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
                                    />
                                </TableCell>
                                <TableCell>Repository</TableCell>
                                <TableCell>Language</TableCell>
                                <TableCell align="right">Stars</TableCell>
                                <TableCell>Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {repositories.map((repo) => (
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
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={totalCount}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(_, newPage) => setPage(newPage)}
                    onRowsPerPageChange={(event) => {
                        setRowsPerPage(parseInt(event.target.value, 10));
                        setPage(0);
                    }}
                />
            </Paper>
        </Box>
    );
}; 