import React, { useEffect, useRef } from 'react';
import * as userInfo from "@/components/userInfo";
import { ref, set, onValue } from "firebase/database";
import { database } from "@/components/firebase";
import { v4 as uuidv4 } from 'uuid';

const BrunnerWebcamStream = ({ title }) => {
  const videoRef = useRef(null);
  const peerRef = useRef(null);
  const sessionId = useRef(uuidv4()); // 고유한 세션 ID 생성
  const adminSessionId = 'hbsim0605'; // 고유한 세션 ID 생성

  useEffect(() => {
    const getCameraStream = async () => {
      // WebRTC 연결 설정
      var peer = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        iceTransportPolicy: 'all'  // ICE 후보 수집을 모든 경로에서 활성화
      });

      addPeerEvent(peer);

      if (userInfo.isAdminUser()) {
        // 관리자(송출자) 로직
        try {
          peer.onicecandidate = (event) => {
            if (event.candidate) {
              set(ref(database, `webrtc/${adminSessionId}/candidate`), event.candidate.toJSON());
            }
          };

          // Firebase에서 일반 사용자의 Offer 감지 후 처리
          onValue(ref(database, `webrtc/${adminSessionId}/offer`), async (snapshot) => {
            console.log("Offer received from Firebase:", snapshot.val());  // 로그 추가
            const offer = snapshot.val();
            if (!offer) return;

            // 연결 상태 확인
            if (peer.signalingState !== 'closed') {
              peer.setRemoteDescription(new RTCSessionDescription(offer))
                .then(async () => {
                  console.log("Remote description set successfully");
                })
                .catch(error => {
                  console.error("Failed to set remote description:", error);
                });
            } else {
              console.log("Cannot set remote description: PeerConnection is closed.");
            }

            // createAnswer 호출 전에 signalingState가 'closed' 상태인지 다시 확인
            if (peer.signalingState !== 'closed') {
              try {
                const answerDescription = await peer.createAnswer();
                await peer.setLocalDescription(answerDescription);
                console.log('Answer created and local description set.');
                
                set(ref(database, `webrtc/${adminSessionId}/answer`), {
                  type: answerDescription.type,
                  sdp: answerDescription.sdp,
                });
              } catch (error) {
                console.error('Failed to create answer:', error);
              }
            } else {
              console.error('Peer connection is closed. Cannot create answer.');
            }
          });
        } catch (error) {
          console.error("Error accessing camera:", error);
        }

        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (videoRef.current) videoRef.current.srcObject = stream;
        stream.getTracks().forEach((track) => peer.addTrack(track, stream));
        console.log("Local stream added to peer connection");
      } else {
        // Firebase에서 관리자의 Answer 감지 후 처리
        onValue(ref(database, `webrtc/${adminSessionId}/answer`), async (snapshot) => {
          const answer = snapshot.val();
          if (!answer) return;

          // peer.signalingState가 'closed'인 경우 새로운 RTCPeerConnection 객체 생성
          if (peer.signalingState === "closed") {
            console.log("Peer connection is closed. Creating a new connection.");

            // 기존 peerConnection 종료
            peer.close();

            // 새로운 RTCPeerConnection 객체 생성
            peer = new RTCPeerConnection();

            addPeerEvent(peer);

            // 새로 생성된 peer에서 다시 연결을 설정해야 할 경우 추가 작업 필요
            // 예: setLocalDescription 등
          }

          // 연결이 종료된 상태가 아니라면 answer를 remoteDescription으로 설정
          if (peer.signalingState !== "closed" && peer.signalingState !== "stable") {
            try {
              await peer.setRemoteDescription(new RTCSessionDescription(answer));
              console.log("Remote description set successfully.");
            } catch (error) {
              console.error("Failed to set remote description:", error);
            }
          }
        });

        // Firebase에서 관리자의 ICE Candidate 감지 후 처리
        onValue(ref(database, `webrtc/${adminSessionId}/candidate`), async (snapshot) => {
          const candidate = snapshot.val();
          if (candidate) {
            await peer.addIceCandidate(new RTCIceCandidate(candidate));
          }
        });

        // Offer 생성 후 Firebase에 저장
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);

        // Firebase에 Offer 저장
        set(ref(database, `webrtc/${adminSessionId}/offer`), {
          type: offer.type,
          sdp: offer.sdp
        }).then(() => {
          console.log(`Offer saved to Firebase:\nsessionId:${adminSessionId}\nsdp:${offer.sdp}`);
        });
      }
    };

    const addPeerEvent = (peerObj) => {
     // 일반 사용자(수신자) 로직
     peerObj.ontrack = (event) => {
      if (videoRef.current) {
        videoRef.current.srcObject = event.streams[0];
        console.log("Video stream received from remote peer");
      } else {
        console.log("No videoRef found to display stream");
      }
    };

    peerObj.onicecandidate = (event) => {
      if (event.candidate) {
        set(ref(database, `webrtc/${adminSessionId}/candidate`), event.candidate.toJSON());
      }
    };
    
    peerRef.current = peerObj;

    peerObj.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', peerObj.iceConnectionState);
    };

    }

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