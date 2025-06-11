import { useRouter } from 'next/router';
import DocumentDesignerContainer from '@/components/edoc/DocumentDesignerContainer';

export default function DocumentDesignerPage() {
  const router = useRouter();
  const { id } = router.query;

  if (!id) return <div>로딩 중...</div>;

  return <DocumentDesignerContainer documentId={id} />;
}