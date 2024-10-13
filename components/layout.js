import Header from './header';
import Footer from './footer';
import LeftMenu from './leftMenu';

export default function Layout({ children }) {
  return (
    <>
      <div className="flex bg-primary min-h-screen">
        <LeftMenu></LeftMenu>
        <div className="px-2 w-screen">
          <Header />
          <main>{children}</main>
          <Footer />
        </div>
      </div>
    </>
  );
}