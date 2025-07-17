import { useEffect, useState } from "react";
import Link from "next/link";
import { isMobile } from 'react-device-detect';
import * as constants from "@/components/constants";
import * as userInfo from "@/components/userInfo";
import RequestServer from "@/components/requestServer";

export default function LeftMenu({ reloadSignal }) {
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
  }, [reloadSignal]);  // reloadSignal이 바뀌면 다시 호출

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

              {/* 기타 메뉴들 */}

              <hr className="my-4 border-gray-400" />

              <Link className={`block text-gray-600 dark:text-gray-100 py-2`} href="/eDoc/eDocDesigner">
                Document Designer
              </Link>
              <li className="text-gray-500 dark:text-gray-300 py-1">My Documents</li>

              {documentList.length > 0 && documentList.map((doc) => {
                // menu_path가 없으면 기본값으로 `/edocument/{id}`
                const menuPath = doc.menu_path || `/edocument/${doc.id}`;

                return (
                  <Link
                    key={doc.id}
                    href={menuPath}
                    className="block text-gray-600 dark:text-gray-100 py-2"
                  >
                    {doc.title}
                  </Link>
                );
              })}
            </ul>
          </nav>
        </aside>
      )}
    </>
  );
}
