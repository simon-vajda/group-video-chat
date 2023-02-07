import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import Peer from './peer';

const socket = io('http://localhost:5000');

function CallDemo() {
  const [isConnected, setIsConnected] = useState<boolean>(socket.connected);
  const [streams, setStreams] = useState<MediaStream[]>([]);
  const myVideoRef = useRef<HTMLVideoElement>(null);

  async function getRandomDeviceId() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter((d) => d.kind === 'videoinput');
    const randomIndex = Math.floor(Math.random() * videoDevices.length);
    return videoDevices[randomIndex].deviceId;
  }

  async function initMedia(pc: RTCPeerConnection) {
    navigator.mediaDevices
      .getUserMedia({
        audio: true,
        video: {
          deviceId: await getRandomDeviceId(),
        },
      })
      .then((stream) => {
        console.log('my stream id', stream.id);
        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream);
          console.log(`stream track (${track.kind}) id: ${track.id}`);
        });

        if (myVideoRef.current) {
          myVideoRef.current.srcObject = stream;
        }
      });
  }

  useEffect(() => {
    const peer = new Peer(socket);

    peer.connection.onconnectionstatechange = (event) => {
      console.log('onconnectionstatechange', event);
      setIsConnected(peer.connection.connectionState === 'connected');
    };

    peer.connection.ontrack = (event) => {
      console.log('track', event);
      if (event.streams.length === 0 || event.track.kind === 'audio') return;
      setStreams((prev) => [...prev, event.streams[0]]);
    };

    socket.on('connect', async () => {
      initMedia(peer.connection);
    });

    socket.on('disconnect', () => {
      peer.connection.close();
      setIsConnected(false);
    });

    socket.on('peer-disconnected', (id: string) =>
      console.log('peer-disconnected', id),
    );

    return () => {
      socket.off();
    };
  }, []);

  useEffect(() => {
    console.log('streams', streams);
  }, [streams]);

  return (
    <div>
      <p>Connected: {isConnected}</p>
      <p>My video</p>
      <video
        autoPlay
        playsInline
        height={300}
        width={300}
        ref={myVideoRef}
        muted
      />
      <p>Streams: {streams.length}</p>
      <div style={{ display: 'flex' }}>
        {streams.map((stream, i) => (
          <video
            key={i}
            autoPlay
            playsInline
            ref={(el) => {
              if (el) {
                el.srcObject = stream;
              }
            }}
            style={{ objectFit: 'cover' }}
            height={300}
            width={300}
          />
        ))}
      </div>
    </div>
  );
}

export default CallDemo;
