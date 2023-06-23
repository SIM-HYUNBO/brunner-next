import Header from './header'
import Footer from './footer'

export default function Layout({children}){
    return (
        <div className="bg-primary h-full w-full">
            <Header/>
            <div>{children}</div>
            <Footer/>
        </div>
    );
}
