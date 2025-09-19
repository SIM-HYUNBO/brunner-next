`use strict`;

import useInitTheme from "@/hooks/useInitTheme";
import Layout from "@/components/core/client/frames/layout";
import WorkflowContent from "@/components/contents/workflowContent";

export default function Workflow() {
  useInitTheme();

  return (
    <>
      <WorkflowContent />
    </>
  );
}

// 페이지 전용 Layout 적용
Workflow.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};
