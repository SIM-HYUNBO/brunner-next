import Header from './header'
import Footer from './footer'

export default function Layout({children}){
    return (
        <div className="bg-primary h-screen w-screen">
            <Header/>
            <div>{children}</div>
            <Footer/>
        </div>
    );
}
