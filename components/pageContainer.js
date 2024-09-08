`use strict`

export default function PageContainer({ children }) {
    return (
        <div className="container">
            {children}
        </div>
    );
}