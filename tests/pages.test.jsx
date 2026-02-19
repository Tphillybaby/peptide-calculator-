/**
 * Page Integration Tests
 * Tests for main page components
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../src/context/AuthContext';
import React from 'react';

// Mock Supabase
vi.mock('../src/lib/supabase', () => ({
    supabase: {
        auth: {
            getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
            onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
        },
        from: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({
                    data: [
                        { id: 1, name: 'BPC-157', category: 'Healing Peptide', description: 'A healing peptide' },
                        { id: 2, name: 'Semaglutide', category: 'GLP-1', description: 'Weight loss peptide' },
                    ],
                    error: null
                }),
                eq: vi.fn().mockResolvedValue({ data: [], error: null }),
                single: vi.fn().mockResolvedValue({ data: null, error: null }),
            }),
        }),
    }
}));

// Mock react-helmet-async
vi.mock('react-helmet-async', () => ({
    Helmet: ({ children }) => <>{children}</>,
    HelmetProvider: ({ children }) => <>{children}</>,
}));

// Helper to render with providers
const renderWithProviders = (component) => {
    return render(
        <BrowserRouter>
            <AuthProvider>
                {component}
            </AuthProvider>
        </BrowserRouter>
    );
};

describe('Encyclopedia Page', () => {
    let Encyclopedia;

    beforeEach(async () => {
        const module = await import('../src/pages/Encyclopedia.jsx');
        Encyclopedia = module.default;
    });

    it('renders page title', async () => {
        renderWithProviders(<Encyclopedia />);

        await waitFor(() => {
            expect(screen.getByText('Peptide Encyclopedia')).toBeInTheDocument();
        });
    });

    it('renders search input', async () => {
        renderWithProviders(<Encyclopedia />);

        await waitFor(() => {
            expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
        });
    });



    it('displays categories by default and peptides after search', async () => {
        renderWithProviders(<Encyclopedia />);

        // Wait for loading to complete and categories to appear
        await waitFor(() => {
            expect(screen.getByText(/Muscle & Recovery/i)).toBeInTheDocument();
            expect(screen.getByText(/2 Total Peptides/i)).toBeInTheDocument();
        });

        // Search for a peptide
        const searchInput = screen.getByPlaceholderText(/search all/i);
        fireEvent.change(searchInput, { target: { value: 'BPC-157' } });

        // Verify peptide appears
        await waitFor(() => {
            expect(screen.getByText('BPC-157')).toBeInTheDocument();
        });
    });

    it('has social share button', async () => {
        renderWithProviders(<Encyclopedia />);

        await waitFor(() => {
            const shareButton = screen.getByRole('button', { name: /share this page/i });
            expect(shareButton).toBeInTheDocument();
        });
    });
});

describe('Guides Page', () => {
    let Guides;

    beforeEach(async () => {
        const module = await import('../src/pages/Guides.jsx');
        Guides = module.default;
    });

    it('renders page title', async () => {
        renderWithProviders(<Guides />);

        await waitFor(() => {
            expect(screen.getByText(/peptide guides/i)).toBeInTheDocument();
        });
    });

    it('has social share button', async () => {
        renderWithProviders(<Guides />);

        await waitFor(() => {
            const shareButton = screen.getByRole('button', { name: /share this page/i });
            expect(shareButton).toBeInTheDocument();
        });
    });
});

describe('Calculator Page', () => {
    let Calculator;

    beforeEach(async () => {
        const module = await import('../src/pages/Calculator.jsx');
        Calculator = module.default;
    });

    it('renders calculator title', async () => {
        renderWithProviders(<Calculator />);

        await waitFor(() => {
            expect(screen.getByText(/reconstitution calculator/i)).toBeInTheDocument();
        });
    });

    it('has input fields for calculation', async () => {
        renderWithProviders(<Calculator />);

        await waitFor(() => {
            // Should have number inputs for peptide amount, water volume, etc.
            const inputs = screen.getAllByRole('spinbutton');
            expect(inputs.length).toBeGreaterThan(0);
        });
    });
});
