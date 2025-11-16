`use strict`;

import { useState } from "react";
import Layout from "@/components/core/client/frames/layout";
import EDocDesignerContainer from "@/components/eDoc/eDocDesignerContainer";
import useInitTheme from "@/hooks/useInitTheme";

export default function EDocDesigner() {
  const documentId = null;

  useInitTheme();

  return (
    <Layout>
      <EDocDesignerContainer documentId={documentId} />
    </Layout>
  );
}
