/* eslint-disable react-hooks/exhaustive-deps */
import {
  ActionIcon,
  AspectRatio,
  Button,
  Center,
  Container,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
  Transition,
} from '@mantine/core';
import { useEffect, useState, useMemo, useRef } from 'react';
import ToggleButton from './ToggleButton';
import {
  TbMicrophone,
  TbMicrophoneOff,
  TbVideo,
  TbVideoOff,
  TbUserCircle,
  TbX,
  TbSettings,
} from 'react-icons/tb';
import { showNotification } from '@mantine/notifications';
import { useSelector } from 'react-redux/es/exports';
import {
  selectUserMedia,
  setAudioEnabled,
  setVideoEnabled,
  toggleAudio,
  toggleVideo,
} from '../state/userMediaSlice';
import { useDispatch } from 'react-redux/es/hooks/useDispatch';
import { setUsername } from '../state/userSlice';
import { useCheckRoomQuery } from '../api/roomApi';
import { useParams } from 'react-router-dom';
import useMuter from '../hooks/useMuter';

function JoinScreen() {
  const { id: roomId } = useParams();

  const [name, setName] = useState('');
  const [localStream, setLocalStream] = useState<MediaStream>(
    new MediaStream(),
  );
  const localStreamRef = useRef(localStream);
  const hasVideo = localStream.getVideoTracks().length > 0;

  const dispatch = useDispatch();
  const userMedia = useSelector(selectUserMedia);

  useMuter(localStream);

  const {
    data: roomExists,
    isLoading,
    isSuccess,
    isError,
  } = useCheckRoomQuery(roomId!);

  const loadUserMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });

      if (!userMedia.audioEnabled) {
        stream.getAudioTracks().forEach((track) => {
          track.enabled = false;
        });
      }

      if (!userMedia.videoEnabled) {
        stream.getVideoTracks().forEach((track) => {
          track.enabled = false;
        });
      }

      setLocalStream(stream);
      localStreamRef.current = stream;
    } catch (err) {
      showNotification({
        title: 'Permission denied',
        message: 'You need to allow camera and microphone access',
        color: 'red',
        icon: <TbX size={24} />,
      });
      dispatch(setAudioEnabled(false));
      dispatch(setVideoEnabled(false));
    }
  };

  useEffect(() => {
    loadUserMedia();

    return () => {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const handleAudioToggle = (turnedOn: boolean) => {
    dispatch(toggleAudio());
  };

  const handleVideoToggle = (turnedOn: boolean) => {
    dispatch(toggleVideo());
  };

  const previewVideo = useMemo(
    () => (
      <video
        autoPlay
        muted
        ref={(el) => {
          if (el && localStream) {
            el.srcObject = localStream;
          }
        }}
        style={{
          objectFit: 'cover',
          height: '100%',
          width: '100%',
          borderRadius: 8,
          transform: 'scaleX(-1)',
          WebkitTransform: 'scaleX(-1)',
        }}
      />
    ),
    [localStream],
  );

  const joinRoom = () => {
    dispatch(setUsername(name));
  };

  return (
    <Container size="sm" h="100%">
      <Stack h="100%" justify="center" spacing={40}>
        <Stack spacing="sm">
          <AspectRatio ratio={16 / 9}>
            {userMedia.videoEnabled && hasVideo ? (
              previewVideo
            ) : (
              <Paper w="100%" h="100%">
                <Center>
                  <Stack align="center">
                    <TbVideoOff size={64} />
                    <Text size="xl">No video</Text>
                  </Stack>
                </Center>
              </Paper>
            )}
          </AspectRatio>
          <Group position="center">
            <ToggleButton
              onIcon={<TbMicrophone size={24} />}
              offIcon={<TbMicrophoneOff size={24} />}
              onClick={handleAudioToggle}
              value={userMedia.audioEnabled}
            />
            <ToggleButton
              onIcon={<TbVideo size={24} />}
              offIcon={<TbVideoOff size={24} />}
              onClick={handleVideoToggle}
              value={userMedia.videoEnabled}
            />
            <ActionIcon size="xl" radius="xl" variant="filled">
              <TbSettings size={24} />
            </ActionIcon>
          </Group>
        </Stack>
        <Transition mounted={isLoading} transition="pop" timingFunction="ease">
          {(styles) => (
            <Center style={styles}>
              <Loader />
            </Center>
          )}
        </Transition>
        <Transition
          mounted={isSuccess && roomExists}
          transition="pop"
          timingFunction="ease"
        >
          {(styles) => (
            <form onSubmit={joinRoom} style={styles}>
              <Stack>
                <TextInput
                  placeholder="Your name"
                  onChange={(e) => setName(e.target.value)}
                  value={name}
                  icon={<TbUserCircle size={24} />}
                  size="md"
                />
                <Button disabled={name.length === 0} size="md" type="submit">
                  Join
                </Button>
              </Stack>
            </form>
          )}
        </Transition>
        <Transition
          mounted={isSuccess && !roomExists}
          transition="pop"
          timingFunction="ease"
        >
          {(styles) => (
            <Center style={styles}>
              <Stack align="center" spacing={0}>
                <Title order={3}>Room not found</Title>
                <Text c="dimmed" size="lg">
                  Please check the room ID
                </Text>
              </Stack>
            </Center>
          )}
        </Transition>
        <Transition mounted={isError} transition="pop" timingFunction="ease">
          {(styles) => (
            <Center style={styles}>
              <Stack align="center" spacing={0}>
                <Title order={3}>Network error</Title>
                <Text c="dimmed" size="lg">
                  Please check your internet connection
                </Text>
              </Stack>
            </Center>
          )}
        </Transition>
      </Stack>
    </Container>
  );
}

export default JoinScreen;
