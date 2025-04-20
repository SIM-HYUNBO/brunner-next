import React, { useEffect, useState, useRef, useCallback } from 'react';
import ReactPlayer from 'react-player';
import * as userInfo from "@/components/userInfo";
import { ref, set, onValue, onChildAdded, push , off} from "firebase/database";
import { database } from "@/components/firebase";
import { v4 as uuidv4 } from 'uuid';

const adminSessionId = "hbsim0605"; // 고정 세션 ID

// 관리자 역할을 위한 컴포넌트
const AdminStream = () => {
  const adminVideoRef = useRef(null);
  const peerRef = useRef(null);
  const pendingCandidates = useRef([]); // ICE 후보 큐
  const remoteSet = useRef(false); // remoteDescription 상태 추적

  useEffect(() => {
    const video = adminVideoRef.current;
    if (!video) return;

    const onPlaying = () => console.log("▶️ playing 상태 진입");
    const onPause = () => console.log("⏸️ 영상이 정지됨");
    const onWaiting = () => console.log("⏳ 버퍼링 중...");

    video.addEventListener("playing", onPlaying);
    video.addEventListener("pause", onPause);
    video.addEventListener("waiting", onWaiting);

    return () => {
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("waiting", onWaiting);
    };
  }, []);

  useEffect(() => {
    const startBroadcast = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      // 🎥 로컬 스트림을 비디오 태그에 표시
      if (adminVideoRef.current) {
        adminVideoRef.current.srcObject = stream;
      }

      // 📡 피어 연결 설정
      const peer = new RTCPeerConnection({
        iceServers: [{
          urls: [ "stun:stun.l.google.com:19302", "stun:hk-turn1.xirsys.com" ]
       }, {
          username: "UDdjy-hiebI7qfJxvEVkG4WE2MDmS-mcY3YykqnJbYhbJRPtzZZYjdgsKaRgCf3XAAAAAGf70-xoYnNpbTA2MDU=",
          credential: "73dfea7a-1879-11f0-9530-0242ac120004",
          urls: [
              "turn:hk-turn1.xirsys.com:80?transport=udp",
              "turn:hk-turn1.xirsys.com:3478?transport=udp",
              "turn:hk-turn1.xirsys.com:80?transport=tcp",
              "turn:hk-turn1.xirsys.com:3478?transport=tcp",
              "turns:hk-turn1.xirsys.com:443?transport=tcp",
              "turns:hk-turn1.xirsys.com:5349?transport=tcp"
          ]
       }],
      });
      peerRef.current = peer;

      // 🎙️ 트랙 추가
      stream.getTracks().forEach((track) => {
        console.log(`🎙️ 방송자 track 전송: ${track.kind}, enabled: ${track.enabled}`);
        peer.addTrack(track, stream);
      });

      // ❄️ ICE 후보 수집
      peer.onicecandidate = (event) => {
        if (event.candidate) {
          const candidateRef = push(ref(database, `webrtc/${adminSessionId}/candidates`));
          set(candidateRef, {
            candidate: event.candidate.candidate,
            sdpMid: event.candidate.sdpMid,
            sdpMLineIndex: event.candidate.sdpMLineIndex,
            usernameFragment: event.candidate.usernameFragment,
          });
        } else {
          console.log("✅ ICE 후보 수집 완료");
        }
      };

      // 📤 Offer 생성 및 전송
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      set(ref(database, `webrtc/${adminSessionId}/offer`), offer);

      // 📥 Answer 수신 처리
      const answerRef = ref(database, `webrtc/${adminSessionId}/answer`);
      onValue(answerRef, async (snapshot) => {
        const answer = snapshot.val();
        if (!answer || !answer.type || !answer.sdp) {
          console.warn("❗ 유효하지 않은 answer 수신:", answer);
          return;
        }

        if (!peerRef.current.remoteDescription) {
          try {
            await peerRef.current.setRemoteDescription(new RTCSessionDescription(answer));
            console.log("✅ Answer 수신 및 remoteDescription 설정 완료");
            remoteSet.current = true;

            // 🔁 후보 큐 처리
            for (const c of pendingCandidates.current) {
              try {
                await peerRef.current.addIceCandidate(new RTCIceCandidate(c));
                console.log("✅ 큐에서 ICE 후보 추가:", c);
              } catch (err) {
                console.error("❌ ICE 후보 추가 실패 (큐):", err);
              }
            }
            pendingCandidates.current = [];
          } catch (err) {
            console.error("❌ remoteDescription 설정 실패:", err);
          }
        }
      });

      // 📥 시청자 ICE 후보 수신 처리
      const candidatesRef = ref(database, `webrtc/${adminSessionId}/viewerCandidates`);
      onValue(candidatesRef, (snapshot) => {
        const candidates = snapshot.val();
        if (!candidates) return;

        Object.values(candidates).forEach((candidate) => {
          const candidateData = {
            candidate: candidate.candidate,
            sdpMid: candidate.sdpMid,
            sdpMLineIndex: candidate.sdpMLineIndex,
          };

          if (remoteSet.current && peerRef.current.remoteDescription) {
            peerRef.current.addIceCandidate(new RTCIceCandidate(candidateData))
              .then(() => {
                console.log("📥 ICE 후보 추가 완료:", candidateData);
              })
              .catch((err) => {
                console.error("❌ ICE 후보 추가 실패:", err);
              });
          } else {
            console.log("⏳ ICE 후보 대기열에 저장:", candidateData);
            pendingCandidates.current.push(candidateData);
          }
        });
      });

      // 🔍 ICE 연결 상태 추적
      peer.oniceconnectionstatechange = () => {
        console.log("🔌 ICE 연결 상태:", peer.iceConnectionState);
        if (peer.iceConnectionState === "connected") {
          console.log("✅ ICE 연결 완료");
        }
      };

      // 🌐 연결 상태 추적
      peer.onconnectionstatechange = () => {
        console.log("🌐 연결 상태:", peer.connectionState);
        if (peer.connectionState === "failed") {
          console.error("❌ 연결 실패");
        }
      };

      // 📶 시그널링 상태 추적
      peer.onsignalingstatechange = () => {
        console.log("📶 시그널링 상태 변경:", peer.signalingState);
      };

      // ❄️ ICE 후보 수집 상태 추적
      peer.onicegatheringstatechange = () => {
        console.log("❄️ ICE 후보 수집 상태 변경:", peer.iceGatheringState);
      };
    };

    startBroadcast();
  }, []);

  return (
    <div>
      <h2>📡 방송자 화면 (관리자)</h2>
      <video
        ref={adminVideoRef}
        autoPlay
        playsInline
        muted
        style={{ width: "640px", height: "360px", backgroundColor: "black" }}
      />
    </div>
  );
};

const UserStream = ({ adminSessionId }) => {

  const [connectionState, setConnectionState] = useState("");
  const peerRef = useRef(null);
  const pendingCandidates = useRef([]); // ICE 후보를 임시로 저장할 큐

  const userVideoRef = useRef(null);

  const handleVideoRef = useCallback((node) => {
    if (node !== null) {
      userVideoRef.current = node;
      console.log("✅ video DOM 연결 완료");
  
      // video DOM이 준비된 후 실행
      startUserStream();
    }
  }, []);


  const startUserStream = async () => {
    // 1. PeerConnection 객체 생성
    const peer = new RTCPeerConnection({
      iceServers: [{
        urls: [ "stun:stun.l.google.com:19302", "stun:hk-turn1.xirsys.com" ]
     }, {
        username: "UDdjy-hiebI7qfJxvEVkG4WE2MDmS-mcY3YykqnJbYhbJRPtzZZYjdgsKaRgCf3XAAAAAGf70-xoYnNpbTA2MDU=",
        credential: "73dfea7a-1879-11f0-9530-0242ac120004",
        urls: [
            "turn:hk-turn1.xirsys.com:80?transport=udp",
            "turn:hk-turn1.xirsys.com:3478?transport=udp",
            "turn:hk-turn1.xirsys.com:80?transport=tcp",
            "turn:hk-turn1.xirsys.com:3478?transport=tcp",
            "turns:hk-turn1.xirsys.com:443?transport=tcp",
            "turns:hk-turn1.xirsys.com:5349?transport=tcp"
        ]
     }],
    });

    peerRef.current = peer;

    peer.oniceconnectionstatechange = () => {
      console.log("🔌 ICE 연결 상태 변경:", peer.iceConnectionState);
      setConnectionState(`Peer Ice Connection ${peer.iceConnectionState}`);

      playVideo();
    };
    
    peer.onconnectionstatechange = () => {
      console.log("🌐 Peer 연결 상태 변경:", peer.connectionState);
      setConnectionState(`Peer Connection ${peer.connectionState}`);
    };
    
    peer.onsignalingstatechange = () => {
      console.log("📶 시그널링 상태 변경:", peer.signalingState);
      setConnectionState(`Peer Signal State ${peer.signalingState}`);
    };
    
    peer.onicegatheringstatechange = () => {
      console.log("❄️ ICE 후보 수집 상태 변경:", peer.iceGatheringState);
      setConnectionState(`Peer Ice Gathering State ${peer.iceGatheringState}`);
    };

    // 2. ICE 후보 수집 시 Firebase에 전송
    peer.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("🧊 ICE 후보 발견:", event.candidate);
        const candidateRef = ref(database, `webrtc/${adminSessionId}/viewerCandidates`);
        set(candidateRef, {
          candidate: event.candidate.candidate,
          sdpMid: event.candidate.sdpMid,
          sdpMLineIndex: event.candidate.sdpMLineIndex,
          usernameFragment: event.candidate.usernameFragment,
        });
      } else {
        console.log("✅ ICE 후보 수집 완료");
      }
    };

    // 3. Firebase에서 관리자(방송자)의 offer를 가져와서 연결
    const offerRef = ref(database, `webrtc/${adminSessionId}/offer`);
    onValue(offerRef, async (snapshot) => {
      const offer = snapshot.val();
      if (!offer) {
        
        return;
      }
      console.log("📥 관리자(방송자)의 Offer 수신:", offer);

      // 4. 수신한 offer로 remoteDescription 설정
      await peer.setRemoteDescription(new RTCSessionDescription(offer)).then(() => {
        console.log("✅ remoteDescription 설정 성공:", offer);  
      }).catch((err) => {
        console.error("❌ remoteDescription 실패:", err);
        return;
      });

      // 5. Answer 생성
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);

      // 6. 생성된 answer를 Firebase에 저장
      set(ref(database, `webrtc/${adminSessionId}/answer`), peer.localDescription);

      // 8. 큐에 저장된 ICE 후보 추가
      pendingCandidates.current.forEach((candidate) => {
        const candidateData = {
          candidate: candidate.candidate,
          sdpMid: candidate.sdpMid,
          sdpMLineIndex: candidate.sdpMLineIndex,
        };
        peer.addIceCandidate(new RTCIceCandidate(candidateData))
          .then(() => {
            console.log("📥 ICE 후보 추가:", candidateData);
          })
          .catch(err => {
            console.error("❗ ICE 후보 추가 실패:", err);
          });
      });

      // 9. 큐 초기화
      pendingCandidates.current = [];
    });

    // 10. ICE 후보 수신
    const candidatesRef = ref(database, `webrtc/${adminSessionId}/candidates`);
    onValue(candidatesRef, async (snapshot) => {
      const candidates = snapshot.val();
      if (!candidates) return;

      // ICE 후보가 remoteDescription 설정 전에 도착한 경우 큐에 저장
      Object.values(candidates).forEach(async (candidate) => {
        try {
          const candidateData = {
            candidate: candidate.candidate,
            sdpMid: candidate.sdpMid,
            sdpMLineIndex: candidate.sdpMLineIndex,
          };
          
          if (peer.remoteDescription) {
            // remoteDescription이 설정된 경우 즉시 add
            await peer.addIceCandidate(new RTCIceCandidate(candidateData));
            console.log("📥 ICE 후보 추가:", candidate);
          } else {
            // remoteDescription이 아직 설정되지 않은 경우 후보를 큐에 저장
            pendingCandidates.current.push(candidateData);
            console.log("⏳ ICE 후보 큐에 저장:", candidate);
          }
        } catch (err) {
          console.error("❗ ICE 후보 추가 실패:", err);
        }
      });
    });

    // 11. 스트림을 받을 준비가 되면 비디오 출력
    peer.ontrack = (event) => {
      const remoteStream = event.streams[0];
      console.log("📥 remoteStream 수신됨:", remoteStream); // 디버깅용 로그 추가
      if (userVideoRef.current && remoteStream) {
        
        if(!userVideoRef.current.srcObject){  
          userVideoRef.current.srcObject = remoteStream;
          console.log("✅ 비디오 출력 설정됨");

          // 비디오가 로드되었을 때 onloadeddata 발생하게 설정
          userVideoRef.current.onloadeddata = () => {
            console.log("🎥 비디오 데이터 로드 완료");
            playVideo();
          };
          
          userVideoRef.current.onloadedmetadata = () => {
            playVideo();
          };
        } 

        remoteStream.getTracks().forEach((track) => {
            console.log(`🎚️ 트랙 종류: ${track.kind}, 상태: ${track.readyState}, 활성화: ${track.enabled}`);
            if (track.readyState !== "live") {
              console.log("⏳ 트랙 준비 중...");
            } else if (!track.enabled) {
              console.log("❗ 트랙이 비활성화 상태");
              track.enabled = true;  // 트랙을 활성화
            } else {
              console.log("🎥 트랙이 활성화되고 준비됨");
            }
          });          
      } else {
        console.warn("❗ remoteStream이 없거나 userVideoRef가 유효하지 않습니다.");
      }
    };
  };

  const playVideo = () => {
    if (peerRef.current.iceConnectionState === "connected") {
      if (userVideoRef.current && userVideoRef.current.srcObject) {
        userVideoRef.current.play().then(() => {
          setConnectionState("✅ ICE 연결 후 비디오 재생됨");
        }).catch((err) => {
          setConnectionState("✅ ICE 연결 후 비디오 재생 실패");
        });
      }
    }
  }

  useEffect(() => {
    const video = userVideoRef.current;
    if (!video) return;
  
    const onPlaying = () => console.log("▶️ playing 상태 진입");
    const onPause = () => console.log("⏸️ 영상이 정지됨");
    const onWaiting = () => console.log("⏳ 버퍼링 중...");
  
    video.addEventListener("playing", onPlaying);
    video.addEventListener("pause", onPause);
    video.addEventListener("waiting", onWaiting);
    
    return () => {
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("waiting", onWaiting);
    };
  }, []);

  useEffect(() => {
    // 비디오 스트림이 설정될 때마다 확인
    if (userVideoRef.current && userVideoRef.current.srcObject) {
      console.log("video stream set:", userVideoRef.current.srcObject);
    }
  }, [userVideoRef.current?.srcObject]);

  return (
    <div>
      <h2>🎥 사용자 스트림 (UserStream)</h2>
      <video
        ref={handleVideoRef }
        autoPlay
        playsInline
        muted
        style={{
          width: "640px",
          height: "360px",
          backgroundColor: "black",
          objectFit: "cover", // 비디오가 화면을 덮도록 설정
        }}
      />
      {<p>{connectionState}</p>}  
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
