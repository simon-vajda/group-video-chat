/* eslint-disable react-hooks/exhaustive-deps */
import {
  AspectRatio,
  Button,
  Center,
  Container,
  Grid,
  Group,
  Loader,
  Paper,
  Select,
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
  TbLogin,
} from 'react-icons/tb';
import { showNotification } from '@mantine/notifications';
import { useSelector } from 'react-redux/es/exports';
import {
  selectUserMedia,
  setAudioDeviceId,
  setAudioEnabled,
  setVideoDeviceId,
  setVideoEnabled,
  toggleAudio,
  toggleVideo,
} from '../state/userMediaSlice';
import { useDispatch } from 'react-redux/es/hooks/useDispatch';
import { selectUser, setUsername } from '../state/userSlice';
import { useCheckRoomQuery } from '../api/roomApi';
import { useParams } from 'react-router-dom';
import useMuter from '../hooks/useMuter';

interface JoinScreenProps {
  setReady: (ready: boolean) => void;
}

function JoinScreen({ setReady }: JoinScreenProps) {
  const { id: roomId } = useParams();

  const [name, setName] = useState('');
  const [localStream, setLocalStream] = useState<MediaStream>(
    new MediaStream(),
  );
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const localStreamRef = useRef(localStream);
  const hasVideo = localStream.getVideoTracks().length > 0;

  const dispatch = useDispatch();
  const userMedia = useSelector(selectUserMedia);
  const user = useSelector(selectUser);

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
        audio: userMedia.audioDeviceId
          ? { deviceId: userMedia.audioDeviceId }
          : true,
        video: userMedia.videoDeviceId
          ? { deviceId: userMedia.videoDeviceId }
          : { facingMode: 'user' },
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
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const videoDevices = devices.filter(
        (device) => device.kind === 'videoinput',
      );
      const audioDevices = devices.filter(
        (device) => device.kind === 'audioinput',
      );

      setVideoDevices(videoDevices);
      setAudioDevices(audioDevices);

      if (userMedia.videoDeviceId === '' && videoDevices.length > 0) {
        const defaultCamera = videoDevices[0];
        console.log('default camera', defaultCamera);
        dispatch(setVideoDeviceId(defaultCamera.deviceId));
      }
      if (userMedia.audioDeviceId === '' && audioDevices.length > 0) {
        dispatch(setVideoDeviceId(audioDevices[0].deviceId));
      }
    });

    return () => {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    };
  }, []);

  useEffect(() => {
    if (videoDevices.length > 0 && audioDevices.length > 0) {
      loadUserMedia();
    }
  }, [
    userMedia.videoDeviceId,
    userMedia.audioDeviceId,
    videoDevices,
    audioDevices,
  ]);

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
    if (!user.token) {
      dispatch(setUsername(name));
    }
    setReady(true);
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
          <Grid justify="space-between" align="center" gutter="xs">
            <Grid.Col span={12} xs="content" orderXs={2}>
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
              </Group>
            </Grid.Col>
            <Grid.Col span={12} xs="auto" orderXs={1}>
              <Select
                icon={<TbMicrophone size={20} />}
                placeholder="Default microphone"
                data={audioDevices.map((d) => ({
                  label: d.label,
                  value: d.deviceId,
                }))}
                value={userMedia.audioDeviceId}
                onChange={(v) => {
                  if (v) dispatch(setAudioDeviceId(v));
                }}
              />
            </Grid.Col>
            <Grid.Col span={12} xs="auto" orderXs={3}>
              <Select
                icon={<TbVideo size={20} />}
                placeholder="Default camera"
                data={videoDevices.map((d) => ({
                  label: d.label,
                  value: d.deviceId,
                }))}
                value={userMedia.videoDeviceId}
                onChange={(v) => {
                  if (v) dispatch(setVideoDeviceId(v));
                }}
              />
            </Grid.Col>
          </Grid>
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
                {!user.token && (
                  <TextInput
                    placeholder="Your name"
                    onChange={(e) => setName(e.target.value)}
                    value={name}
                    icon={<TbUserCircle size={24} />}
                    size="md"
                    maxLength={30}
                  />
                )}
                <Button
                  disabled={name.length === 0 && user.token === ''}
                  size="md"
                  type="submit"
                  leftIcon={<TbLogin size={20} />}
                >
                  {user.token ? `Join as ${user.name}` : `Join`}
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
