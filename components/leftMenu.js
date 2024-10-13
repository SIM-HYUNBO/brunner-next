`use strict`
import Link from "next/link";

export default function LeftMenu() {

    return (

        <aside className=" dark:bg-slate-800 px-4 pt-32 desktop:w-32">
            <nav className="fixed">
                <ul>
                    <Link className="block text-gray-600 dark:text-gray-100 py-2" href="/">
                        Home
                    </Link>
                    <Link className="block text-gray-600 dark:text-gray-100 py-2" href="/mainPages/clips">
                        Clips
                    </Link>
                    <Link className="block text-gray-600 dark:text-gray-100 py-2" href="/mainPages/contact">
                        Contact
                    </Link>
                    {/* <li><a href="/mainPages/clips" className="block text-green-900 dark:text-green-200 py-2">Clips</a></li>
                    <li><a href="/mainPages/contact" className="block text-green-900 dark:text-green-200 py-2">Contact</a></li> */}
                </ul>
            </nav>
        </aside>
    );
};