`use strict`

export default function LeftMenu() {

    return (

        <aside className="bg-slate-800 dark:bg-slate-800 dark:text-green-900  px-10 pt-32 w-36">
            <nav className="fixed">
                <ul>
                    <li><a href="/" className="block py-2">Home</a></li>
                    <li><a href="#services" className="block py-2">Enjoy</a></li>
                    <li><a href="/mainPages/contact" className="block py-2">Contact</a></li>
                </ul>
            </nav>
        </aside>
    );
};