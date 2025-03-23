`use strict`

import { useState, useRef, useEffect } from 'react';
import Layout from '@/components/layout'
import Head from 'next/head'
import BodySection from '@/components/bodySection'

import ClipsContent from './content/clipsContent'
import { useTheme } from 'next-themes'

export default function Clips() {
    useEffect(() => {
        setThemeRef(themeRef.current);
    }, []);

    const { theme, setTheme } = useTheme()
    const themeRef = useRef(theme);

    const setThemeRef = (newValue) => {
        themeRef.current = newValue;
        setTheme(newValue);
    };

    return (
        <Layout>
            <Head>
                <title>Stock Quotes and Investment Information - Brunner-Next</title>
                <meta name="description" content="Brunner-Next provides real-time stock quotes. Make effective investments with real-time stock charts, investment strategies, stock news, and stock analysis tools."></meta>
                <meta rel="icon" href="/brunnerLogo.png"></meta>
                <link></link>
            </Head>
            <BodySection>
                <ClipsContent />
            </BodySection>
        </Layout>
    );
}