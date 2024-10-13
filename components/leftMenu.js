`use strict`

export default function LeftMenu() {

    return (

        <aside className=" dark:bg-slate-800 px-4 pt-32 desktop:w-32">
            <nav className="fixed">
                <ul>
                    <li><a href="/" className="block text-green-900 dark:text-green-200 py-2">Home</a></li>
                    <li><a href="/mainPages/clips" className="block text-green-900 dark:text-green-200 py-2">Clips</a></li>
                    <li><a href="/mainPages/contact" className="block text-green-900 dark:text-green-200 py-2">Contact</a></li>
                </ul>
            </nav>
        </aside>
    );
};