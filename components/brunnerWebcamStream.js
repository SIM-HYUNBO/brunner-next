import React, { useEffect, useRef } from 'react';
import * as userInfo from "@/components/userInfo";
import { ref, set, onValue, onChildAdded, push , off} from "firebase/database";
import { database } from "@/components/firebase";
import { v4 as uuidv4 } from 'uuid';

// 관리자 역할을 위한 컴포넌트
const AdminStream = ({ adminSessionId }) => {
  const adminVideoRef = useRef(null);
  const peerRef = useRef(null);

  useEffect(() => {
    const getCameraStream = async () => {
      const peer = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        iceTransportPolicy: 'all',
      });
      
      peer.onicecandidate = (event) => {
        if (event.candidate) {
          console.log("🧊 ICE candidate 발견:", event.candidate);
          const newCandidateRef = push(ref(database, `webrtc/${adminSessionId}/candidates`));
          set(newCandidateRef, event.candidate)
            .then(() => console.log("📡 ICE 후보 Firebase에 저장 완료"))
            .catch((err) => console.error("❌ ICE 후보 저장 실패:", err));
        } else {
          console.log("🎉 ICE 후보 전송 완료");
        }
      };

      peerRef.current = peer;

      // 🎥 로컬 스트림 연결
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      adminVideoRef.current.srcObject = stream;
      stream.getTracks().forEach((track) => peer.addTrack(track, stream));
      console.log("✅ Local stream added to peer connection", stream);

      // 📡 Offer 생성 및 Firebase 저장
      const offer = await peer.createOffer();
      console.log("생성된 SDP:", offer.sdp);

      await peer.setLocalDescription(offer);
      await set(ref(database, `webrtc/${adminSessionId}/offer`), {
        type: offer.type,
        sdp: offer.sdp,
      });
      console.log(`✅ Offer saved to Firebase: ${adminSessionId}`);

      peer.oniceconnectionstatechange = () => {
        console.log('ICE 연결 상태 state:', peer.iceConnectionState);
      };
    };

    adminVideoRef.current.addEventListener('playing', () => {
      console.log('🎬 Video is playing');
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
      <video
        ref={adminVideoRef}
        autoPlay
        muted
        controls
        crossOrigin="anonymous"
        playsInline
        width="100%"
        height="auto"
        style={{ border: '2px solid black' }}
      />
    </div>
  );
};

const UserStream = ({ adminSessionId }) => {
  const userVideoRef = useRef(null);
  const peerRef = useRef(null);
  const pendingCandidatesRef = useRef([]); // ICE 후보 대기 저장소

  useEffect(() => {
    const videoElement = userVideoRef.current;

    if (videoElement) {
      const handleLoadedData = () => {
        console.log("✅ 첫 번째 비디오 프레임 로드 완료");

        videoElement.play().catch((err) => {
          console.error("비디오 재생 실패:", err);
        });
      };

      videoElement.addEventListener("loadeddata", handleLoadedData);

      return () => {
        videoElement.removeEventListener("loadeddata", handleLoadedData);
      };
    }
  }, []);

  useEffect(() => {
    const getStream = async () => {
      const peer = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        iceTransportPolicy: 'all',
      });

      peerRef.current = peer;

      // 📥 원격 스트림 수신
      peer.ontrack = (event) => {
        console.log("📥 ontrack 이벤트 발생", event);
        const remoteStream = event.streams[0];
        console.log("📦 stream info:", remoteStream);

        if (remoteStream && userVideoRef.current) {
          userVideoRef.current.srcObject = remoteStream;

          if (userVideoRef.current.srcObject) {
            console.log("🎬 비디오의 srcObject 존재함:", userVideoRef.current.srcObject);
            console.log("📡 스트림 트랙:", userVideoRef.current.srcObject.getTracks());
          } else {
            console.warn("❗ 비디오 srcObject가 없음");
          }
        } else {
          console.error("Remote stream 없음.");
        }
      };

      peer.oniceconnectionstatechange = () => {
        console.log("🔁 ICE 연결 상태:", peer.iceConnectionState);
      };

      // 🔹 ICE 후보 수신 및 보관
      const candidatesRef = ref(database, `webrtc/${adminSessionId}/candidates`);
      onChildAdded(candidatesRef, async (snapshot) => {
        const candidate = snapshot.val();
        if (!candidate) return;

        if (peer.remoteDescription) {
          try {
            await peer.addIceCandidate(new RTCIceCandidate(candidate));
            console.log("🧊 ICE candidate 즉시 추가 완료");
          } catch (error) {
            console.error("❌ ICE candidate 추가 실패:", error);
          }
        } else {
          console.log("⏳ ICE 후보 보관 중:", candidate);
          pendingCandidatesRef.current.push(candidate);
        }
      });

      // 🔹 Offer 수신 → remoteDescription 설정 → answer 생성 및 전송
      let offerProcessed = false;
      const offerRef = ref(database, `webrtc/${adminSessionId}/offer`);
      onValue(offerRef, async (snapshot) => {
        if (offerProcessed) return;
        offerProcessed = true;

        const offer = snapshot.val();
        if (!offer) return;

        await peer.setRemoteDescription(new RTCSessionDescription(offer));
        console.log("📡 Offer 수신 및 remoteDescription 설정 완료");

        // 🔸 보관된 ICE 후보들 추가
        for (const candidate of pendingCandidatesRef.current) {
          try {
            await peer.addIceCandidate(new RTCIceCandidate(candidate));
            console.log("🧊 보관된 ICE 후보 추가 완료");
          } catch (error) {
            console.error("❌ 보관된 ICE 후보 추가 실패:", error);
          }
        }
        pendingCandidatesRef.current = []; // 클리어

        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);

        await set(ref(database, `webrtc/${adminSessionId}/answer`), {
          type: answer.type,
          sdp: answer.sdp,
        });

        console.log("✅ Answer 생성 및 Firebase 전송 완료");
      });
    };

    getStream();

    // 🔹 정리(cleanup)
    return () => {
      if (peerRef.current) {
        peerRef.current.close();
      }

      off(ref(database, `webrtc/${adminSessionId}/offer`));
      off(ref(database, `webrtc/${adminSessionId}/candidates`));
    };
  }, [adminSessionId]);

  return (
    <div>
      <video
        ref={userVideoRef}
        playsInline
        autoPlay
        muted
        width="100%"
        height="auto"
        crossOrigin="anonymous"
        style={{ border: '2px solid black' }}
      />
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
