// pages/mainPages/edocument.js
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function RedirectToDynamic() {
  const router = useRouter();
  const { documentId } = router.query;

  useEffect(() => {
    if (documentId) {
      router.replace(`/mainPages/edocument/${documentId}`); 
    }
  }, [documentId]);

  return null;
}