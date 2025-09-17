import { useState } from "react";
import Layout from "@/components/frames/layout";
import EDocDesignerContainer from "@/components/eDoc/eDocDesignerContainer";
import useInitTheme from "@/hooks/useInitTheme";

export default function EDocDesigner() {
  const [reloadSignal, setReloadSignal] = useState(0);
  const triggerMenuReload = () => setReloadSignal((prev) => prev + 1);
  const documentId = null;

  useInitTheme();

  return (
    <Layout reloadSignal={reloadSignal} triggerMenuReload={triggerMenuReload}>
      <EDocDesignerContainer
        documentId={documentId}
        triggerMenuReload={triggerMenuReload}
      />
    </Layout>
  );
}
