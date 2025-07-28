import Head from 'next/head';
import EDocEditorCanvas from '@/components/eDoc/eDocEditorCanvas';
import * as constants from '@/components/constants';
import * as commonFunctions from '@/components/commonFunctions';

export async function getServerSideProps(context) {
  const { documentId } = context.params;

  // 서버 API 호출 (fetch, axios 등)
  const res = await fetch(`${process.env.API_BASE_URL}/edoc/${documentId}`);
  const json = await res.json();

  if (json.error_code !== 0) {
    return {
      notFound: true,
    };
  }

  const documentData = json.documentData || {};

  return {
    props: { documentData },
  };
}

export default function EDocumentSSR({ documentData }) {
  const components = documentData.components || [];

  const title =
    components.find(c => c.type === constants.edocComponentType._TEXT)?.runtime_data?.text?.slice(0, 60) ||
    documentData.title ||
    '전자문서';

  const description =
    components
      .filter(c => c.type === constants.edocComponentType._TEXT || c.type === constants.edocComponentType._INPUT)
      .map(c => c.runtime_data?.text || c.runtime_data?.label || '')
      .join(' ')
      .slice(0, 160) || '전자문서 내용 요약';

  const ogImage =
    components.find(c => c.type === constants.edocComponentType._IMAGE || c.type === constants.edocComponentType._VIDEO)?.runtime_data?.src ||
    '/default-og-image.png';

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />

        {/* OpenGraph */}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://yourdomain.com/edocument/${documentData.id}`} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={ogImage} />
      </Head>

      <h2 className="title-font sm:text-4xl text-3xl font-medium text-green-800 dark:text-green-200 my-20">
        {documentData.title}
      </h2>

      <main
        className="flex-grow edoc-designer-canvas"
        style={{ backgroundColor: documentData.runtime_data?.backgroundColor || '#f8f8f8' }}
      >
        <div
          className="w-full"
          style={{ backgroundColor: documentData.runtime_data?.backgroundColor || '#f8f8f8' }}
        >
          {(documentData.pages || [{
            id: 'page-1',
            components: documentData.components || [],
            runtime_data: documentData.runtime_data || {},
          }]).map(page => (
            <EDocEditorCanvas
              key={page.id}
              pageData={page}
              isViewerMode={true}
              mode="runtime"
              bindingData={commonFunctions.bindingData}
              style={{ width: '100%', minWidth: 0, overflow: 'visible' }}
            />
          ))}
        </div>
      </main>
    </>
  );
}