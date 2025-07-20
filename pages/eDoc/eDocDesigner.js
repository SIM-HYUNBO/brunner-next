`use strict`

import { useState, useRef, useEffect } from 'react';
import { useTheme } from 'next-themes'
import Layout from '@/components/layout'
import Head from 'next/head'
import BodySection from '@/components/bodySection'

import EDocDesignerContainer from '@/components/eDoc/eDocDesignerContainer';
import DivContainer from '@/components/divContainer';

export default function EDocDesigner() {
 const [reloadSignal, setReloadSignal] = useState(0);

  const { theme, setTheme } = useTheme()
  const themeRef = useRef(theme);

  const setThemeRef = (newValue) => {
    themeRef.current = newValue;
    setTheme(newValue);
  };

  // ✅ 이 부분이 반드시 있어야 함
  const triggerLeftMenuReload = () => {
    setReloadSignal(prev => prev + 1);
  };

  useEffect(() => {
    setThemeRef(themeRef.current);
  }, []);

  const documentId = null;

  return (
    <Layout reloadSignal={reloadSignal} triggerLeftMenuReload={triggerLeftMenuReload}>
      <Head>
        <title>Stock Quotes and Investment Information - Brunner-Next</title>
        <meta name="description" content="Brunner-Next provides real-time stock quotes. Make effective investments with real-time stock charts, investment strategies, stock news, and stock analysis tools."></meta>
        <meta rel="icon" href="/brunnerLogo.png"></meta>
        <link></link>
      </Head>
      <BodySection>
          <DivContainer>
            <div className={`w-full desktop:w-full items-start text-left`}>
              <h2 className={`title-font sm:text-4xl text-3xl my-20 font-medium text-green-900`}>
                {`Page Designer`}
              </h2>
              <EDocDesignerContainer documentId={documentId} 
                                     triggerLeftMenuReload={triggerLeftMenuReload}/>
            </div>
            </DivContainer>
      </BodySection>
    </Layout>
  );
}