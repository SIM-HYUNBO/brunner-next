
export default function BodySection({ children }) {
    return (
        <section className="text-gray-600 body-font h-full">
            <p>
                {/* 광고 단위 생성 */}
                <ins className="adsbygoogle"
                    style={{ display: 'block' }}
                    data-ad-client="ca-pub-3879149687745447"
                    data-ad-slot="5669803344"
                    data-ad-format="auto"
                    data-full-width-responsive="true"></ins>

                <ins className="adsbygoogle"
                    style={{ display: 'block' }}
                    data-ad-client="ca-pub-3879149687745447"
                    data-ad-slot="5876281933"
                    data-ad-format="auto"
                    data-full-width-responsive="true"></ins>

                <ins className="adsbygoogle"
                    style={{ display: 'block' }}
                    data-ad-client="ca-pub-3879149687745447"
                    data-ad-slot="6930914120"
                    data-ad-format="auto"
                    data-full-width-responsive="true"></ins>

                <ins className="adsbygoogle"
                    style={{ display: 'block' }}
                    data-ad-format="fluid"
                    data-ad-layout-key="-6t+ed+2i-1n-4w"
                    data-ad-client="ca-pub-3879149687745447"
                    data-ad-slot="5426260766"></ins>

                <ins className="adsbygoogle"
                    style={{ display: 'block', textAlign: 'center' }}
                    data-ad-layout="in-article"
                    data-ad-format="fluid"
                    data-ad-client="ca-pub-3879149687745447"
                    data-ad-slot="2851234162"></ins>

                <ins className="adsbygoogle"
                    style={{ display: 'block' }}
                    data-ad-format="autorelaxed"
                    data-ad-client="ca-pub-3879149687745447"
                    data-ad-slot="7911989152"></ins>
            </p>
            {children}
        </section>
    );
}