import dynamic from 'next/dynamic';
import { useState, useRef } from 'react';

const ReactPlayer = dynamic(() => import('react-player'), { ssr: false });

const BrunnerVideo = ({ title, url }) => {
    const [size, setSize] = useState({ width: 640, height: 360 });
    const videoRef = useRef(null);

    const handleMouseDown = (e) => {
        e.preventDefault();
        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = size.width;
        const startHeight = size.height;

        const handleMouseMove = (e) => {
            const newWidth = startWidth + (e.clientX - startX);
            const newHeight = Math.round((newWidth * 9) / 16); // 유지할 비율 (16:9)

            setSize({
                width: Math.max(320, Math.min(newWidth, 1280)), // 최소 320px, 최대 1280px
                height: Math.max(180, Math.min(newHeight, 720)) // 최소 180px, 최대 720px
            });
        };

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    return (
        <div className="w-full h-full">
            <h1 className="text-2xl font-bold text-start mb-4 text-gray-800">{title}</h1>
            <div className="relative" style={{ width: size.width, height: size.height }}>
                <ReactPlayer
                    url={url}
                    controls={true}
                    width="100%"
                    height="100%"
                    className="w-full h-full rounded-lg"
                />
                {/* Resize Handle */}
                <div
                    onMouseDown={handleMouseDown}
                    className="absolute right-0 bottom-0 w-4 h-4 bg-gray-600 cursor-se-resize"
                    style={{ borderBottomRightRadius: '50%' }}
                />
            </div>
        </div>
    );
};

export default BrunnerVideo;