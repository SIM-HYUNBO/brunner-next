`use strict`

import Layout from '@/components/Layout'
import Head from 'next/head'
import BodySection from '@/components/BodySection'

import ClipsContent from './content/clipsContent'

export default function Clips() {
    return (
        <Layout>
            <Head>
                <title>Stock Quotes and Investment Information - Brunner-Next</title>
                <meta name="description" content="Brunner-Next provides real-time stock quotes. Make effective investments with real-time stock charts, investment strategies, stock news, and stock analysis tools."></meta>
                <meta rel="icon" href="/brunnerLogo.png"></meta>
                <link></link>
            </Head>
            <BodySection>
                <ClipsContent></ClipsContent>
            </BodySection>
        </Layout>
    );
}