import {
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
  Transition,
} from '@mantine/core';
import { useEffect, useState, useMemo } from 'react';
import ToggleButton from './ToggleButton';
import {
  TbMicrophone,
  TbMicrophoneOff,
  TbVideo,
  TbVideoOff,
  TbUserCircle,
  TbX,
} from 'react-icons/tb';
import { showNotification } from '@mantine/notifications';

function JoinScreen() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [localStream, setLocalStream] = useState<MediaStream>();
  const haveVideo = localStream && localStream.getVideoTracks().length > 0;

  const loadUserMedia = async (constraints: MediaStreamConstraints) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);
    } catch (err) {
      showNotification({
        title: 'Permission denied',
        message: 'You need to allow camera and microphone access',
        color: 'red',
        icon: <TbX size={24} />,
      });
    }
  };

  useEffect(() => {
    loadUserMedia({ audio: false, video: true });
    setTimeout(() => {
      setLoading(false);
    }, 3000);
  }, []);

  const handleAudioToggle = (turnedOn: boolean) => {};

  const handleVideoToggle = (turnedOn: boolean) => {
    if (turnedOn) {
      loadUserMedia({ audio: true, video: true });
    } else {
      localStream?.getVideoTracks().forEach((track) => track.stop());
    }
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

  return (
    <Container size="sm" h="100%">
      <Stack h="100%" justify="center" spacing={40}>
        <Stack spacing="sm">
          <AspectRatio ratio={16 / 9}>
            {haveVideo ? (
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
            />
            <ToggleButton
              onIcon={<TbVideo size={24} />}
              offIcon={<TbVideoOff size={24} />}
              onClick={handleVideoToggle}
            />
          </Group>
        </Stack>
        <Transition mounted={loading} transition="pop" timingFunction="ease">
          {(styles) => (
            <Center style={styles}>
              <Loader />
            </Center>
          )}
        </Transition>
        <Transition mounted={!loading} transition="pop" timingFunction="ease">
          {(styles) => (
            <Stack style={styles}>
              <TextInput
                placeholder="Your name"
                onChange={(e) => setName(e.target.value)}
                value={name}
                icon={<TbUserCircle size={24} />}
                size="md"
              />
              <Button disabled={name.length === 0} size="md">
                Join
              </Button>
            </Stack>
          )}
        </Transition>
      </Stack>
    </Container>
  );
}

export default JoinScreen;
