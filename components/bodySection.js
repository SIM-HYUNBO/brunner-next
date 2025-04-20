`use strict`

export default function BodySection({ children }) {
    return (
        <section className={`text-gray-600 
                             body-font 
                             h-full`}>
            {children}
        </section>
    );
}