import React, { useEffect, useRef } from 'react';
import * as userInfo from "@/components/userInfo";

const BrunnerWebcamStream = ({title}) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const getCameraStream = async () => {
      if(userInfo.isAdminUser()){
      try {
        // 카메라 접근을 위한 getUserMedia 호출
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true, // 오디오도 포함하고 싶다면 audio: true로 설정
          audio: true, // 오디오를 사용하려면 true로 설정
        });

        // 비디오 스트림을 비디오 태그에 연결
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('카메라 접근 실패:', err);
      }
    }
    };

    // 컴포넌트가 마운트될 때 카메라 스트림을 시작
    getCameraStream();

    // 컴포넌트가 언마운트될 때 스트림을 종료하여 자원을 해제
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  return ( 
    <div>
      <h1 className="mt-5">{title}</h1>
      <video className="border-4 border-blue-500" ref={videoRef} autoPlay playsInline></video>
    </div>
  );
};

export default BrunnerWebcamStream;