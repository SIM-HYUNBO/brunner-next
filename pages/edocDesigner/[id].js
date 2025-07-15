import { useRouter } from 'next/router';
import EDocDesignerContainer from '@/components/eDoc/eDocDesignerContainer';

export default function DocumentDesignerPage() {
  const router = useRouter();
  const { id } = router.query;

  if (!id) return <div>로딩 중...</div>;

  return <EDocDesignerContainer documentId={id} />;
}