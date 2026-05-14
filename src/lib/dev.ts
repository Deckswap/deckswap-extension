// src/lib/dev.ts

import type { ScannedArticle } from './types';

export const DEV_TOOLS = import.meta.env.VITE_DEV_TOOLS === 'true';

export type DetectOverride = 'real' | 'not-logged-in' | 'fetch-error' | 'detected';

export type DevOptions = {
    detectOverride: DetectOverride;
    simulateRateLimit: boolean;
};

export const DEV_DEFAULTS: DevOptions = {
    detectOverride: 'real',
    simulateRateLimit: false,
};

export const FAKE_ARTICLES: ScannedArticle[] = [
    {
        articleId: 'dev-001',
        idProduct: '289943',
        name: 'Charizard',
        expansion: 'Base Set',
        language: 'English',
        condition: 'NM',
        price: 120.00,
        quantity: 1,
        reverseHolo: false,
        firstEdition: true,
        signed: false,
        altered: false,
        playset: false,
        comments: 'PSA-ready',
    },
    {
        articleId: 'dev-002',
        idProduct: '290011',
        name: 'Pikachu',
        expansion: 'Jungle',
        language: 'English',
        condition: 'EX',
        price: 8.50,
        quantity: 2,
        reverseHolo: true,
        firstEdition: false,
        signed: false,
        altered: false,
        playset: false,
        comments: '',
    },
    {
        articleId: 'dev-003',
        idProduct: '289821',
        name: 'Blastoise',
        expansion: 'Base Set',
        language: 'French',
        condition: 'GD',
        price: 45.00,
        quantity: 1,
        reverseHolo: false,
        firstEdition: false,
        signed: false,
        altered: false,
        playset: false,
        comments: '',
    },
    {
        articleId: 'dev-004',
        idProduct: '290188',
        name: 'Mewtwo',
        expansion: 'Base Set',
        language: 'German',
        condition: 'PO',
        price: 22.99,
        quantity: 3,
        reverseHolo: false,
        firstEdition: false,
        signed: false,
        altered: false,
        playset: false,
        comments: 'Small crease on bottom',
    },
    {
        articleId: 'dev-005',
        idProduct: '412334',
        name: 'Lugia',
        expansion: 'Neo Genesis',
        language: 'English',
        condition: 'MT',
        price: 299.99,
        quantity: 1,
        reverseHolo: false,
        firstEdition: true,
        signed: false,
        altered: false,
        playset: false,
        comments: '',
    },
    {
        articleId: 'dev-006',
        idProduct: '501209',
        name: 'Umbreon',
        expansion: 'Neo Discovery',
        language: 'English',
        condition: 'EX',
        price: 55.00,
        quantity: 1,
        reverseHolo: false,
        firstEdition: false,
        signed: false,
        altered: false,
        playset: false,
        comments: '',
    },
];
