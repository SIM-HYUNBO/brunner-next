`use strict`

import Link from "next/link";
import Image from 'next/image'
import * as userInfo from '@/components/userInfo'
import Container from '@/components/container'

export default function Header() {
    const UserInfo = userInfo.default;

    return (
        <>
            <header className="text-gray-600 body-font mb-10">
                <Container>
                    <nav className="md:ml-auto flex flex-wrap items-center text-base justify-center">
                        <Link className="flex title-font font-medium items-center text-gray-900 mb-4 md:mb-0" href="/">
                            <Image src="/brunnerLogo.png" height={100} width={100} alt='brunner logo' priority='true' />
                        </Link>
                        <Link className="flex title-font font-medium items-center text-gray-900 mb-4 md:mb-0" href="/">
                            <h1 className="title-font sm:text-4xl text-3xl m-5 font-medium text-orange-900">Brunner
                                <br className="hidden lg:inline-block" />
                            </h1>
                        </Link>
                        <span className="ml-3 text-xl"></span>
                        <Link className="mr-5 text-gray-600 dark:text-gray-100 hover:text-gray-400" href="/mainPages/contact">
                            Contact
                        </Link>
                        {userInfo.isAdminUser() && <Link className="mr-5 text-gray-600 dark:text-gray-100 hover:text-gray-400" href="/mainPages/administration">
                            Administration
                        </Link>}
                        <Link href="/" className="ml-4 flex items-center">
                            <Image src="/homeIcon.png" height={24} width={24} alt="home icon" />
                        </Link>
                        <UserInfo />
                    </nav>
                </Container>
            </header>
        </>
    );
}