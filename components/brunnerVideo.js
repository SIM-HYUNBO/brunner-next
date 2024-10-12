`use strict`

import React from 'react';


import dynamic from 'next/dynamic';

const ReactPlayer = dynamic(() => import('react-player'), { ssr: false });

// type: "video/mp4", "video/webm" 등
const BrunnerVideo = ({ title, url, width, height }) => {

    return (
        <div className="w-full h-full">
            <h1 className="text-2xl font-bold text-start mb-4 text-gray-800">{title}</h1>
            <div className="relative pb-9/16 rounded overflow-hidden bg-white">
                <ReactPlayer
                    url={url}
                    controls={true}
                    width={width}
                    height={height}
                    className="w-full h-full rounded-lg"
                />
            </div>
        </div>
    );
};

export default BrunnerVideo;