`use strict`

import dynamic from 'next/dynamic';
import { useState, useEffect, useRef } from 'react';

const ReactPlayer = dynamic(() => import('react-player'), { ssr: false });

const BrunnerVideo = ({ title, url, className, originalWidth = 640, originalHeight = 360 }) => {
    const [size, setSize] = useState({ width: originalWidth, height: originalHeight });
    const containerRef = useRef(null);

    useEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                const containerWidth = containerRef.current.clientWidth;

                // 부모 div 너비와 원본 너비 중 작은 값을 선택
                const newWidth = Math.min(containerWidth, originalWidth);
                const aspectRatio = originalWidth / originalHeight;

                // 비율에 따라 높이 계산
                const newHeight = Math.round(newWidth / aspectRatio);

                setSize({
                    width: newWidth,
                    height: newHeight
                });
            }
        };

        // ResizeObserver를 사용해 부모 div 크기 변경 감지
        const resizeObserver = new ResizeObserver(updateSize);
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        // 컴포넌트 언마운트 시 옵저버 해제
        return () => {
            if (containerRef.current) {
                resizeObserver.unobserve(containerRef.current);
            }
        };
    }, [originalWidth, originalHeight]);

    return (
        <div className={className} ref={containerRef}>
            <p className={`text-start mb-1 text-gray-800 w-full`}>{title}</p>
            <div className={`relative`} style={{ width: size.width, height: size.height }}>
                <ReactPlayer
                    url={url}
                    controls={true}
                    width="100%"
                    height="100%"
                    className={`w-full h-full rounded-lg`}
                />
            </div>
        </div>
    );
};

export default BrunnerVideo;