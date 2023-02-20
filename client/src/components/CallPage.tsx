/* eslint-disable react-hooks/exhaustive-deps */
import {
  ActionIcon,
  Box,
  Button,
  Center,
  Container,
  Group,
  Loader,
  Paper,
} from '@mantine/core';
import { useEffect, useState } from 'react';
import {
  TbMicrophone,
  TbMicrophoneOff,
  TbVideo,
  TbVideoOff,
  TbPhoneX,
} from 'react-icons/tb';
import { useDispatch, useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import Peer from '../peer';
import {
  selectUserMedia,
  setAudioEnabled,
  toggleAudio,
  toggleVideo,
} from '../state/userMediaSlice';
import { setUsername } from '../state/userSlice';
import VideoGrid from './VideoGrid';

// const socket = io();
// const socket = io('http://localhost:5000');

function CallPage() {
  const [localStream, setLocalStream] = useState<MediaStream>(
    new MediaStream(),
  );
  const [streams, setStreams] = useState<MediaStream[]>([]);
  const [loading, setLoading] = useState(true);

  const dispatch = useDispatch();
  const userMedia = useSelector(selectUserMedia);

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
        setLoading(false);
      });
  }

  useEffect(() => {
    const socket = io('http://localhost:5000');
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
      localStream.getTracks().forEach((track) => track.stop());
      peer.connection.close();
    };
  }, []);

  useEffect(() => {
    localStream.getAudioTracks().forEach((track) => {
      track.enabled = userMedia.audioEnabled;
    });
  }, [userMedia.audioEnabled]);

  useEffect(() => {
    localStream.getVideoTracks().forEach((track) => {
      track.enabled = userMedia.videoEnabled;
    });
  }, [userMedia.videoEnabled]);

  useEffect(() => {
    console.log('streams');
  }, [streams]);

  const endCall = () => {
    dispatch(setUsername(''));
  };

  return (
    <Container
      fluid
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      {loading ? (
        <Center
          sx={{
            flexGrow: 1,
          }}
        >
          <Loader />
        </Center>
      ) : (
        <VideoGrid
          streams={streams}
          localStream={localStream}
          sx={{ flexGrow: 1 }}
        />
      )}
      <Group position="center" mt="md">
        <ActionIcon
          size="xl"
          radius="xl"
          variant="filled"
          color={userMedia.audioEnabled ? 'gray' : 'gray'}
          onClick={() => dispatch(toggleAudio())}
        >
          {userMedia.audioEnabled ? (
            <TbMicrophone size={24} />
          ) : (
            <TbMicrophoneOff size={24} />
          )}
        </ActionIcon>
        <ActionIcon
          size="xl"
          radius="xl"
          variant="filled"
          color={userMedia.videoEnabled ? 'gray' : 'gray'}
          onClick={() => dispatch(toggleVideo())}
        >
          {userMedia.videoEnabled ? (
            <TbVideo size={24} />
          ) : (
            <TbVideoOff size={24} />
          )}
        </ActionIcon>
        <Button color="red" leftIcon={<TbPhoneX size={16} />} onClick={endCall}>
          End Call
        </Button>
      </Group>
    </Container>
  );
}

export default CallPage;
