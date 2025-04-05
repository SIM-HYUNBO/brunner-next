import React, { useEffect, useRef } from 'react';
import { ref, onValue } from "firebase/database";
import { database } from "@/components/firebase";

const UserStream = ({ adminSessionId }) => {
  const videoRef = useRef(null);
  const peerRef = useRef(null);

  useEffect(() => {
    const getStream = async () => {
      let peer = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        iceTransportPolicy: 'all',
      });

      peerRef.current = peer;

      // Firebase에서 관리자의 offer를 감지하고 처리
      onValue(ref(database, `webrtc/${adminSessionId}/offer`), async (snapshot) => {
        const offer = snapshot.val();
        if (!offer) return;

        // Offer 수신 후 Remote Description 설정
        if (peer.signalingState !== 'closed') {
          await peer.setRemoteDescription(new RTCSessionDescription(offer));
          console.log("Remote description set successfully.");
        }

        // Answer 생성 후 Firebase에 저장
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        await set(ref(database, `webrtc/${adminSessionId}/answer`), {
          type: answer.type,
          sdp: answer.sdp,
        });
        console.log('Answer created and sent to Firebase.');
      });

      // Firebase에서 ICE 후보 감지 후 처리
      onValue(ref(database, `webrtc/${adminSessionId}/candidate`), async (snapshot) => {
        const candidate = snapshot.val();
        if (candidate) {
          await peer.addIceCandidate(new RTCIceCandidate(candidate));
          console.log("ICE candidate added successfully.");
        }
      });

      // Remote Track 수신 및 화면에 표시
      peer.ontrack = (event) => {
        if (videoRef.current) {
          const remoteStream = event.streams[0];
          console.log('Received stream:', remoteStream);

          if (remoteStream) {
            videoRef.current.srcObject = remoteStream;
            console.log("Video stream received and displayed.");
          } else {
            console.error("No remote stream found in ontrack event.");
          }
        }
      };
    };

    getStream();

    return () => {
      if (peerRef.current) {
        peerRef.current.close();
      }
    };
  }, [adminSessionId]);

  return (
    <div>
      <h1 className="mt-5">일반 사용자 스트림</h1>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        width="100%"   // 비디오 크기를 화면에 맞게 설정
        height="auto"  // 비디오 크기를 화면에 맞게 설정
        style={{ border: "2px solid black" }} // 비디오 요소 스타일 (디버깅 용)
      ></video>
    </div>
  );
};

export default UserStream;
