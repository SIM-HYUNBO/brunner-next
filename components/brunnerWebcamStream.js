import React, { useEffect, useRef } from 'react';
import * as userInfo from "@/components/userInfo";
import { ref, set, onValue } from "firebase/database";
import { database } from "@/components/firebase";

const BrunnerWebcamStream = ({title}) => {
  const videoRef = useRef(null);
  const peerRef = useRef(null);

  useEffect(() => {

    const getCameraStream = async () => {

      // 🔹 WebRTC PeerConnection 설정
      const peer = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });
      peerRef.current = peer;


      if(userInfo.isAdminUser()){
        // ✅ 관리자(송출자) 로직
        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
          if (videoRef.current) videoRef.current.srcObject = stream;
          stream.getTracks().forEach((track) => peer.addTrack(track, stream));
        });
  
        peer.onicecandidate = (event) => {
          if (event.candidate) {
            set(ref(database, "webrtc/candidate"), event.candidate.toJSON());
          }
        };
  
        // 📌 Firebase에서 일반 사용자의 Offer 감지 후 처리
        onValue(ref(database, "webrtc/offer"), async (snapshot) => {
          const offer = snapshot.val();
          if (!offer) return;
  
          await peer.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await peer.createAnswer();
          await peer.setLocalDescription(answer);
          set(ref(database, "webrtc/answer"), answer.toJSON());
        });
    } else {
      // ✅ 일반 사용자(수신자) 로직
      peer.ontrack = (event) => {
        if (videoRef.current) videoRef.current.srcObject = event.streams[0];
      };

      onValue(ref(database, "webrtc/answer"), async (snapshot) => {
        const answer = snapshot.val();
        if (answer) {
          await peer.setRemoteDescription(new RTCSessionDescription(answer));
        }
      });

      // 📌 Offer 생성 후 Firebase에 저장
      async function sendOffer() {
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        set(ref(database, "webrtc/offer"), offer.toJSON());
      }

      sendOffer();      
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