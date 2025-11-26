`use strict`;

import { useState } from "react";
import Layout from "@/components/core/client/frames/layout";
import EDocDesignerContainer from "@/components/eDoc/eDocDesignerContainer";

export default function EDocDesigner() {
  return (
    <Layout>
      <EDocDesignerContainer />
    </Layout>
  );
}
