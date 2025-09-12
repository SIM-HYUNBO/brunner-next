`use strict`

import { useState, useRef, useEffect } from 'react';
import * as constants from '@/components/constants'
import Layout from '@/components/layout'
import BodySection from '@/components/bodySection'
import AdminContent from './content/adminContent'

export default function AdminPage() {
  return (
    <Layout>
      <BodySection>
        <AdminContent></AdminContent>
      </BodySection>
    </Layout>
  );
}