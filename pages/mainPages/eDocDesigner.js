`use strict`

import { useState, useRef, useEffect } from 'react';
import { useTheme } from 'next-themes'
import Layout from '@/components/layout'
import BodySection from '@/components/bodySection'

import EDocDesignerContainer from '@/components/eDoc/eDocDesignerContainer';
// import DivContainer from '@/components/div';

export default function EDocDesigner() {
 const [reloadSignal, setReloadSignal] = useState(0);

  const { theme, setTheme } = useTheme()
  const themeRef = useRef(theme);

  const setThemeRef = (newValue) => {
    themeRef.current = newValue;
    setTheme(newValue);
  };

  const triggerMenuReload = () => {
    setReloadSignal(prev => prev + 1);
  };

  useEffect(() => {
    setThemeRef(themeRef.current);
  }, []);

  const documentId = null;

  return (
    <Layout reloadSignal={reloadSignal} triggerMenuReload={triggerMenuReload}>
      <BodySection>
         <EDocDesignerContainer documentId={documentId} triggerMenuReload={triggerMenuReload} />
     </BodySection>
    </Layout>
  );
}