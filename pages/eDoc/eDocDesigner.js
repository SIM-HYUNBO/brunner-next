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
    <Layout>
      <BodySection>
        <div className="w-full">
              <EDocDesignerContainer documentId={documentId} 
                                     triggerLeftMenuReload={triggerLeftMenuReload}/>
        </div>
      </BodySection>
    </Layout>

  );
}