`use strict`

export default function LeftMenu() {

    return (

        <aside className="bg-slate-500 dark:bg-slate-800 dark:text-green-900  px-4 pt-32 desktop:w-32">
            <nav className="fixed">
                <ul>
                    <li><a href="/" className="block py-2">Home</a></li>
                    <li><a href="/mainPages/clips" className="block py-2">Clips</a></li>
                    <li><a href="/mainPages/contact" className="block py-2">Contact</a></li>
                </ul>
            </nav>
        </aside>
    );
};