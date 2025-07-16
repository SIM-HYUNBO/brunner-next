'use strict';

import Link from "next/link";
import { isMobile } from 'react-device-detect';
import * as userInfo from "@/components/userInfo";
import { useEffect, useState } from "react";
import * as constants from "@/components/constants";
import RequestServer from "@/components/requestServer";

export default function LeftMenu() {
  const [documentList, setDocumentList] = useState([]);

  useEffect(() => {
    const fetchUserDocuments = async () => {
      const jRequest = {
        commandName: constants.commands.COMMAND_EDOC_DOCUMENT_SELECT_ALL,
        systemCode: process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE,
        userId: userInfo.getLoginUserId(),
      };

      const jResponse = await RequestServer("POST", jRequest);

      if (jResponse.error_code === 0) {
        setDocumentList(jResponse.documentList || []);
      } else {
        console.error(jResponse.error_message);
      }
    };

    fetchUserDocuments();
  }, []);

  return (
    <>
      {!isMobile && (
        <aside className={`dark:bg-slate-800 px-2 pt-32 w-48 desktop:px-4 desktop:pt-32 desktop:w-48`}>
          <nav className={`fixed`}>
            <ul>
              <Link className={`block text-gray-600 dark:text-gray-100 py-2`} href="/">
                Home
              </Link>
              <Link className={`block text-gray-600 dark:text-gray-100 py-2`} href="/mainPages/clips">
                Clips
              </Link>
              <Link className={`block text-gray-600 dark:text-gray-100 py-2`} href="/mainPages/contact">
                Contact
              </Link>

              {userInfo.isAdminUser() && (
                <>
                  <Link
                    className={`block text-gray-600 dark:text-gray-100 py-2`}
                    href="/mainPages/administration"
                  >
                    Administration
                  </Link>
                </>
              )}

              <hr className="my-4 border-gray-400" />

              <Link
                className={`block text-gray-600 dark:text-gray-100 py-2`}
                href="/eDoc/eDocDesigner"
              >
                Document Designer
              </Link>
                <li className="text-gray-500 dark:text-gray-300 py-1">My Documents</li>
              {/* ✅ 사용자 문서 목록 */}
              {documentList.length > 0 && (
                <>
                  {documentList.map((doc) => (
                    <Link
                      key={doc.id}
                      className={`block text-gray-600 dark:text-gray-100 py-2`}
                      href={doc.menu_path}
                    >
                      {doc.title}
                    </Link>
                  ))}
                </>
              )}
            </ul>
          </nav>
        </aside>
      )}
    </>
  );
};