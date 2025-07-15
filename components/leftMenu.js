`use strict`
import Link from "next/link";
import { isMobile, isTablet, isBrowser } from 'react-device-detect';
import * as userInfo from "@/components/userInfo";

export default function LeftMenu() {

    return (
        <>
            {(!isMobile) && <aside className={` dark:bg-slate-800 px-2 pt-32 w-48 desktop:px-4 desktop:pt-32 desktop:w-48`}>
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
                                <Link
                                    className={`block text-gray-600 dark:text-gray-100 py-2`}
                                    href="/eDocDesigner/eDocDesigner"
                                >
                                    Document Designer
                                </Link>
                            </>
                        )}

                    </ul>
                </nav>
            </aside>
            }
        </>
    );
};