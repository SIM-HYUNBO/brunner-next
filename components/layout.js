import Header from './Header';
import Footer from './Footer';
import LeftMenu from './LeftMenu';

export default function Layout({ children }) {
  return (
    <>
      <div className="flex bg-primary min-h-screen">
        <LeftMenu></LeftMenu>
        <div className="px-20">
          <Header />
          <main>{children}</main>
          <Footer />
        </div>
      </div>
    </>
  );
}