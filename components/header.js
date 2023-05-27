import Link from "next/link";
import Image from 'next/image'
import DarkModeToggleButton from "./dark-mode-toggle-button";
import UserInfo from "./user-info";

export default function Header(){
    return (
        <>
            <header className="text-gray-600 body-font">
            <div className="container mx-auto flex flex-wrap p-5 flex-col md:flex-row items-center">
                <Link className="flex title-font font-medium items-center text-gray-900 mb-4 md:mb-0" href="/">
                <Image src="/brunnerLogo.png" height={100} width={100} alt='brunner logo' priority='true' />
                </Link>
                <Link className="flex title-font font-medium items-center text-gray-900 mb-4 md:mb-0" href="/">
                <h1 className="title-font sm:text-4xl text-3xl mb-4 font-medium text-orange-900">Brunner
                    <br className="hidden lg:inline-block"/>
                </h1>
                </Link>
                <span className="ml-3 text-xl"></span>
                <nav className="md:ml-auto flex flex-wrap items-center text-base justify-center">
                <Link className="mr-5 text-gray-600 dark:text-gray-100 hover:text-gray-400" href="/">Home</Link>
                <Link className="mr-5 text-gray-600 dark:text-gray-100 hover:text-gray-400" href="/services">Service</Link>
                <Link className="mr-5 text-gray-600 dark:text-gray-100 hover:text-gray-400" href="/support">Support</Link>
                <Link className="mr-5 text-gray-600 dark:text-gray-100 hover:text-gray-400" href="/board">Board</Link>
                <Link className="mr-5 text-gray-600 dark:text-gray-100 hover:text-gray-400" href="/contact">Contact</Link>
                </nav>
                <DarkModeToggleButton />
                <UserInfo/>
            </div>
            </header>
        </>
    );
}