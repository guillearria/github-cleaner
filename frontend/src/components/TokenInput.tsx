import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Alert } from '@mui/material';
import { validateToken } from '../services/githubApi';

interface TokenInputProps {
    onTokenValidated: (token: string) => void;
}

export const TokenInput: React.FC<TokenInputProps> = ({ onTokenValidated }) => {
    const [token, setToken] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const result = await validateToken(token);
            if (result.valid) {
                onTokenValidated(token);
            } else {
                setError('Invalid GitHub token. Please check and try again.');
            }
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unexpected error occurred.');
            }
        } finally {
            setLoading(false);
        }
    };

    const getErrorSeverity = () => {
        if (!error) return 'error';
        return error.includes('server') ? 'warning' : 'error';
    };

    return (
        <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                maxWidth: 400,
                mx: 'auto',
                mt: 4,
                p: 3,
                borderRadius: 1,
                boxShadow: 1,
            }}
        >
            <Typography variant="h5" component="h1" gutterBottom>
                GitHub Repository Cleaner
            </Typography>
            
            <Typography variant="body1" color="text.secondary" gutterBottom>
                Enter your GitHub personal access token to get started.
            </Typography>

            {error && <Alert severity={getErrorSeverity()}>{error}</Alert>}

            <TextField
                label="GitHub Token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                type="password"
                required
                fullWidth
                variant="outlined"
                disabled={loading}
            />

            <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={!token || loading}
                fullWidth
            >
                {loading ? 'Validating...' : 'Connect'}
            </Button>

            <Typography variant="caption" color="text.secondary" align="center">
                Your token is only used to interact with the GitHub API and is never stored.
            </Typography>
        </Box>
    );
}; 