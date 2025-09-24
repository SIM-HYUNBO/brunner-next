`use strict`;

import { useState } from "react";
import Layout from "@/components/core/client/frames/layout";
import EDocDesignerContainer from "@/components/eDoc/eDocDesignerContainer";
import useInitTheme from "@/hooks/useInitTheme";

export default function EDocDesigner() {
  const [reloadSignal, setReloadSignal] = useState(0);
  const triggermenureload = () => setReloadSignal((prev) => prev + 1);
  const documentId = null;

  useInitTheme();

  return (
    <Layout reloadSignal={reloadSignal} triggermenureload={triggermenureload}>
      <EDocDesignerContainer
        documentId={documentId}
        triggermenureload={triggermenureload}
      />
    </Layout>
  );
}
