import Header from './header';
import Footer from './footer';
import LeftMenu from './leftMenu';

export default function Layout({ children }) {
  return (
    <>
      <div className="flex bg-primary min-h-screen justify-center">
        <LeftMenu></LeftMenu>
        <div className="px-2 w-full desktop:w-3/4 ml-5">
          <Header />
          <main>{children}</main>
          <Footer />
        </div>
      </div>
    </>
  );
}