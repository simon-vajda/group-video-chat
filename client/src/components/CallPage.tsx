/* eslint-disable react-hooks/exhaustive-deps */
import { ActionIcon, Button, Container, Group } from '@mantine/core';
import { useEffect, useState } from 'react';
import {
  TbMicrophone,
  TbMicrophoneOff,
  TbVideo,
  TbVideoOff,
  TbPhoneX,
} from 'react-icons/tb';
import { io } from 'socket.io-client';
import Peer from '../peer';
import VideoGrid from './VideoGrid';

// const socket = io();
const socket = io('http://localhost:5000');

function CallPage() {
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [localStream, setLocalStream] = useState<MediaStream>();
  const [streams, setStreams] = useState<MediaStream[]>([]);

  async function initMedia(pc: RTCPeerConnection) {
    navigator.mediaDevices
      .getUserMedia({
        audio: true,
        video: true,
      })
      .then((stream) => {
        console.log('Local stream', stream);
        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream);
        });
        setLocalStream(stream);
        setStreams([stream]);
      });
  }

  useEffect(() => {
    const peer = new Peer(socket);

    peer.connection.ontrack = (event) => {
      console.log('Track received', event);
      setStreams((prev) => {
        const stream = event.streams[0];
        if (prev.find((s) => s.id === stream.id)) return prev;
        return [...prev, stream];
      });
    };

    socket.on('connect', async () => {
      console.info('Connected to server');
      initMedia(peer.connection);
    });

    socket.on('disconnect', () => {
      peer.connection.close();
    });

    socket.on('peer-disconnected', (streamId: string) => {
      console.info('Peer disconnected', streamId);
      setStreams((prev) => prev.filter((s) => s.id !== streamId));
    });

    return () => {
      socket.off();
    };
  }, []);

  function toggleAudio() {
    const value = !isAudioOn;
    setIsAudioOn(value);
    if (localStream) {
      localStream.getAudioTracks()[0].enabled = value;
    }
  }

  function toggleVideo() {
    const value = !isVideoOn;
    setIsVideoOn(value);
    if (localStream) {
      localStream.getVideoTracks()[0].enabled = value;
    }
  }

  return (
    <Container
      fluid
      py="md"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <VideoGrid
        streams={streams}
        localStream={localStream}
        sx={{
          flexGrow: 1,
        }}
      />
      <Group position="center" mt="md">
        <ActionIcon
          size="xl"
          radius="xl"
          variant="filled"
          color={isAudioOn ? 'gray' : 'gray'}
          onClick={toggleAudio}
        >
          {isAudioOn ? (
            <TbMicrophone size={24} />
          ) : (
            <TbMicrophoneOff size={24} />
          )}
        </ActionIcon>
        <ActionIcon
          size="xl"
          radius="xl"
          variant="filled"
          color={isVideoOn ? 'gray' : 'gray'}
          onClick={toggleVideo}
        >
          {isVideoOn ? <TbVideo size={24} /> : <TbVideoOff size={24} />}
        </ActionIcon>
        <Button color="red" leftIcon={<TbPhoneX size={16} />}>
          End Call
        </Button>
      </Group>
    </Container>
  );
}

export default CallPage;
