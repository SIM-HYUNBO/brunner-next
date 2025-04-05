import React, { useEffect, useRef } from 'react';
import * as userInfo from "@/components/userInfo";
import { ref, set, onValue } from "firebase/database";
import { database } from "@/components/firebase";
import { v4 as uuidv4 } from 'uuid';

const BrunnerWebcamStream = ({ title }) => {
  const videoRef = useRef(null);
  const peerRef = useRef(null);
  const sessionId = useRef(uuidv4()); // 고유한 세션 ID 생성

  useEffect(() => {
    const getCameraStream = async () => {
      // WebRTC 연결 설정
      const peer = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        iceTransportPolicy: 'all'  // ICE 후보 수집을 모든 경로에서 활성화
      });
      peerRef.current = peer;

      if (userInfo.isAdminUser()) {
        // 관리자(송출자) 로직
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          if (videoRef.current) videoRef.current.srcObject = stream;
          stream.getTracks().forEach((track) => peer.addTrack(track, stream));

          peer.onicecandidate = (event) => {
            if (event.candidate) {
              set(ref(database, `webrtc/${sessionId.current}/candidate`), event.candidate.toJSON());
            }
          };

          // Firebase에서 일반 사용자의 Offer 감지 후 처리
          onValue(ref(database, `webrtc/${sessionId.current}/offer`), async (snapshot) => {
            console.log("Offer received from Firebase:", snapshot.val());  // 로그 추가
            const offer = snapshot.val();
            if (!offer) return;

            await peer.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await peer.createAnswer();
            await peer.setLocalDescription(answer);

            set(ref(database, `webrtc/${sessionId.current}/answer`), {
              type: answer.type,
              sdp: answer.sdp,
            });
          });
        } catch (error) {
          console.error("Error accessing camera:", error);
        }
      } else {
        // 일반 사용자(수신자) 로직
        peer.ontrack = (event) => {
          if (videoRef.current) {
            videoRef.current.srcObject = event.streams[0];
            console.log("Video stream received from remote peer");
          } else {
            console.log("No videoRef found to display stream");
          }
        };

        peer.onicecandidate = (event) => {
          if (event.candidate) {
            set(ref(database, `webrtc/${sessionId.current}/candidate`), event.candidate.toJSON());
          }
        };

        // Firebase에서 관리자의 Answer 감지 후 처리
        onValue(ref(database, `webrtc/${sessionId.current}/answer`), async (snapshot) => {
          const answer = snapshot.val();
          if (!answer) return;

          if (peer.signalingState !== "stable") {
            await peer.setRemoteDescription(new RTCSessionDescription(answer));
          }
        });

        // Firebase에서 관리자의 ICE Candidate 감지 후 처리
        onValue(ref(database, `webrtc/${sessionId.current}/candidate`), async (snapshot) => {
          const candidate = snapshot.val();
          if (candidate) {
            await peer.addIceCandidate(new RTCIceCandidate(candidate));
          }
        });

        // Offer 생성 후 Firebase에 저장
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);

        // Firebase에 Offer 저장
        set(ref(database, `webrtc/${sessionId.current}/offer`), {
          type: offer.type,
          sdp: offer.sdp
        }).then(() => {
          console.log(`Offer saved to Firebase:\nsessionId:${sessionId}\nsdp:${offer.sdp}`);
        });
      }
    };

    getCameraStream();

    return () => {
      // 컴포넌트 언마운트 시 리소스 정리
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
      }

      if (peerRef.current) {
        peerRef.current.close();
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