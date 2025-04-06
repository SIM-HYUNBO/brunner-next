import React, { useEffect, useRef } from 'react';
import * as userInfo from "@/components/userInfo";
import { ref, set, onValue } from "firebase/database";
import { database } from "@/components/firebase";
import { v4 as uuidv4 } from 'uuid';

// 관리자 역할을 위한 컴포넌트
const AdminStream = ({ adminSessionId }) => {
  const videoRef = useRef(null);
  const peerRef = useRef(null);

  useEffect(() => {
    const getCameraStream = async () => {
      let peer = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        iceTransportPolicy: 'all',
      });

      peerRef.current = peer;

      // 로컬 스트림을 캡처하여 RTCPeerConnection에 추가
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) {
        if (videoRef.current.srcObject) {
          const tracks = videoRef.current.srcObject.getTracks();
          tracks.forEach(track => track.stop()); // 기존 트랙 중지
        }        
        videoRef.current.srcObject = stream;
        videoRef.current.load();
        videoRef.current.play().catch((error) => {
              console.error("Error playing video:", error);
            } );
      }
      stream.getTracks().forEach((track) => peer.addTrack(track, stream));
      console.log("Local stream added to peer connection");

      // Offer 생성 후 Firebase에 저장
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      await set(ref(database, `webrtc/${adminSessionId}/offer`), {
        type: offer.type,
        sdp: offer.sdp,
      });
      console.log(`Offer saved to Firebase:\nsessionId:${adminSessionId}\nsdp:${offer.sdp}`);

      // ICE 후보를 Firebase에 저장
      peer.onicecandidate = async (event) => {
        if (event.candidate) {
          await set(ref(database, `webrtc/${adminSessionId}/candidate`), event.candidate.toJSON());
          console.log('ICE candidate sent to Firebase.');
        }
      };

      // ICE 연결 상태 변경 이벤트
      peer.oniceconnectionstatechange = () => {
        console.log('ICE connection state:', peer.iceConnectionState);
      };
    };

    videoRef.current.addEventListener('playing', () => {
      console.log('Video is playing');
    });

    getCameraStream();

    return () => {
      if (peerRef.current) {
        peerRef.current.close();
      }
    };
  }, [adminSessionId]);

  return (
    <div>
      <h1 className="mt-5">관리자 스트림</h1>
      <video ref={videoRef}
        playsInline
        width="100%"   // 비디오 크기를 화면에 맞게 설정
        height="auto"  // 비디오 크기를 화면에 맞게 설정
        style={{ border: "2px solid black" }} // 비디오 요소 스타일 (디버깅 용)
        ></video>
    </div>
  );
};

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
        console.log("Video stream received.");
        const remoteStream = event.streams[0];
        if (remoteStream) {
          console.log('Received stream:', remoteStream);
          if (videoRef.current) {
            if (videoRef.current.srcObject) {
              const tracks = videoRef.current.srcObject.getTracks();
              tracks.forEach(track => track.stop()); // 기존 트랙 중지
            }            
          }
          videoRef.current.srcObject = remoteStream;
          videoRef.current.load();
          videoRef.current.play().catch((error) => {
            console.error("Error playing video:", error);
          } );
        } else {
          console.error("No remote stream found in ontrack event.");
        }
      };
    };

    videoRef.current.addEventListener('playing', () => {
      console.log('Video is playing');
    });

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
        playsInline
        width="100%"   // 비디오 크기를 화면에 맞게 설정
        height="auto"  // 비디오 크기를 화면에 맞게 설정
        style={{ border: "2px solid black" }} // 비디오 요소 스타일 (디버깅 용)
      ></video>
    </div>
  );
};

const BrunnerWebcamStream = ({ title }) => {
  const adminSessionId = 'hbsim0605'; // 관리자의 세션 ID
  const userSessionId = uuidv4(); // 일반 사용자 세션 ID (고유값)

  return (
    <div>
      <h1>{title}</h1>
      {userInfo.isAdminUser() ? (
        // 관리자일 경우 관리자 스트림을 표시
        <AdminStream adminSessionId={adminSessionId} />
      ) : (
        // 일반 사용자일 경우 사용자 스트림을 표시
        <UserStream adminSessionId={adminSessionId} />
      )}
    </div>
  );
};

export default BrunnerWebcamStream;
