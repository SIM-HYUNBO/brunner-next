import Head from 'next/head';
import EDocContent from '..edocContent';

export async function getServerSideProps(context) {
  const { documentId } = context.params;

  // 실제 API 주소 및 요청방식에 맞게 수정하세요
  const res = await fetch(`https://api.yoursite.com/documents/${documentId}`);
  const json = await res.json();

  if (!json || json.error_code !== 0) {
    return {
      notFound: true, // 404 페이지 출력
    };
  }

  return {
    props: {
      documentData: json.documentData,
    },
  };
}

export default function EDocument({ documentData }) {
  if (!documentData) {
    return <div>문서를 찾을 수 없습니다.</div>;
  }

  // SEO에 필요한 메타 태그, title 등 설정
  return (
    <>
      <Head>
        <title>{documentData.title || '전자문서'}</title>
        <meta name="description" content={documentData.description || '전자문서 내용 요약'} />
        {/* Open Graph, Twitter 카드 등 추가 가능 */}
      </Head>

      <main>
        <EDocContent initialDocumentData={documentData} />
      </main>
    </>
  );
}