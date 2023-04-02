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
  Text,
  useMantineTheme,
} from '@mantine/core';
import { useEffect, useState } from 'react';
import {
  TbMicrophone,
  TbMicrophoneOff,
  TbVideo,
  TbVideoOff,
  TbPhoneX,
  TbShare2,
  TbHandStop,
  TbLink,
  TbMessage,
} from 'react-icons/tb';
import { useDispatch, useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import RtcClient from '../rtcClient';
import {
  selectUserMedia,
  toggleAudio,
  toggleVideo,
} from '../state/userMediaSlice';
import { selectUser, setUsername } from '../state/userSlice';
import VideoGrid from './VideoGrid';
import { useNavigate, useParams } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import ReactionSelector, { Reaction } from './ReactionSelector';
import { getServerUrl } from '../App';
import useGridItems from '../hooks/useGridItems';
import useMuter from '../hooks/useMuter';
import ChatPanel from './ChatPanel';
import { useMediaQuery } from '@mantine/hooks';
import ChatDrawer from './ChatDrawer';

type PeerID = string;
type StreamID = string;

type Peer = {
  id: PeerID;
  name: string;
  index: number;
  handRaised: boolean;
  reaction: ReactionData;
};

type StreamOwner = {
  streamId: StreamID;
  peerId: PeerID;
};

type ReactionData = {
  value: Reaction;
  timeLeft: number;
};

const REACTION_TIMEOUT = 2000;

function initClient(): RtcClient {
  const socket = io(getServerUrl(), { path: '/api/socket.io' });
  return new RtcClient(socket);
}

function CallPage() {
  const { id: roomId } = useParams();
  const navigate = useNavigate();

  const [client] = useState<RtcClient>(initClient());
  const [localStream, setLocalStream] = useState<MediaStream>(
    new MediaStream(),
  );
  const [streams, setStreams] = useState<MediaStream[]>([]);
  const [peers, setPeers] = useState<Map<PeerID, Peer>>(new Map());
  const [streamOwners, setStreamOwners] = useState<Map<StreamID, PeerID>>(
    new Map(),
  );
  const [loading, setLoading] = useState(true);
  const [handRaised, setHandRaised] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const dispatch = useDispatch();
  const userMedia = useSelector(selectUserMedia);
  const user = useSelector(selectUser);

  const gridItems = useGridItems(streams, peers, streamOwners);
  const theme = useMantineTheme();
  const largeScreen = useMediaQuery(`(min-width: ${theme.breakpoints.sm})`);
  useMuter(localStream);

  async function initMedia(pc: RTCPeerConnection) {
    try {
      const media = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      console.log('Local stream', media);
      media.getTracks().forEach((track) => {
        pc.addTrack(track, media);
      });

      const localPeer: Peer = {
        id: 'local',
        name: user.name,
        index: -1,
        handRaised: false,
        reaction: { value: 'like', timeLeft: 0 },
      };

      setLocalStream(media);
      setPeers((prev) => new Map(prev).set('local', localPeer));
      setStreams((prev) => [...prev, media]);
      setStreamOwners((prev) => new Map(prev).set(media.id, 'local'));
    } catch (err) {
      console.error('Failed to get local stream', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const socket = client.socket;
    const pc = client.connection;

    pc.ontrack = (event) => {
      console.log('Track received', event);
      const stream = event.streams[0];
      setStreams((prev) => {
        if (!prev.includes(stream)) {
          return [...prev, stream];
        }
        return prev;
      });
    };

    socket.on('connect', async () => {
      console.info('Connected to server');
      initMedia(client.connection);
    });

    socket.on('peer-left', (peerId: string) => {
      console.info('Peer left', peerId);
      setPeers((prev) => {
        const newPeers = new Map(prev);
        newPeers.delete(peerId);
        return newPeers;
      });
      setStreamOwners((prev) => {
        const newOwners = new Map(prev);
        newOwners.forEach((owner, streamId) => {
          if (owner === peerId) {
            newOwners.delete(streamId);
            setStreams((prev) => prev.filter((s) => s.id !== streamId));
          }
        });
        return newOwners;
      });
    });

    socket.on('peer-joined', (id: string, name: string, index: number) => {
      console.info('Peer joined', name, id);
      const peer: Peer = {
        id,
        name,
        index,
        handRaised: false,
        reaction: { value: 'like', timeLeft: 0 },
      };
      setPeers((prev) => new Map(prev).set(id, peer));
    });

    socket.on('peer-stream', (streamId: string, peerId: string) => {
      console.log('Peer stream', streamId, peerId);
      setStreamOwners((prev) => new Map(prev).set(streamId, peerId));
    });

    socket.on('peers', (peerList: Peer[], ownerList: StreamOwner[]) => {
      console.log('Peers in room already', peerList);

      setPeers((prev) => {
        const newPeers = new Map(prev);
        peerList.forEach((peer) => {
          peer.reaction = { value: 'like', timeLeft: 0 };
          newPeers.set(peer.id, peer);
        });
        return newPeers;
      });

      setStreamOwners((prev) => {
        const newOwners = new Map(prev);
        ownerList.forEach((owner) => {
          newOwners.set(owner.streamId, owner.peerId);
        });
        return newOwners;
      });
    });

    socket.on('reaction', (reaction: Reaction, peerId: PeerID) => {
      console.log('Reaction received', reaction, peerId);
      setPeers((prev) => {
        const newPeers = new Map(prev);
        const peer = newPeers.get(peerId);
        if (peer) {
          if (reaction === 'hand-up') {
            peer.handRaised = true;
          } else if (reaction === 'hand-down') {
            peer.handRaised = false;
          } else {
            peer.reaction.value = reaction;
            peer.reaction.timeLeft++;

            setTimeout(() => {
              peer.reaction.timeLeft--;
              setPeers((prev) => new Map(prev).set(peerId, peer));
            }, REACTION_TIMEOUT);
          }
          newPeers.set(peerId, peer);
        }

        return newPeers;
      });
    });

    socket.emit('join', user.name, roomId);

    return () => {
      socket.off();
      socket.disconnect();
      pc.close();
    };
  }, []);

  const endCall = () => {
    localStream.getTracks().forEach((track) => track.stop());
    dispatch(setUsername(''));
    navigate('/');
  };

  function copyShareLink() {
    const roomLink =
      window.location.protocol +
      '//' +
      window.location.host +
      `/room/${roomId}`;
    navigator.clipboard.writeText(roomLink);
    notifications.show({
      title: 'Link copied',
      message: 'The room link has been copied to your clipboard',
      autoClose: 1500,
      icon: <TbLink size={18} />,
    });
  }

  function toggleHandRaise() {
    setHandRaised((prev) => {
      const newValue = !prev;
      client.sendReaction(newValue ? 'hand-up' : 'hand-down');
      return newValue;
    });
  }

  return (
    <Container
      fluid
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <Box
        sx={{
          minHeight: '350px',
          height: '100%',
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'row',
        }}
      >
        {loading ? (
          <Center w="100%">
            <Loader />
          </Center>
        ) : (
          <VideoGrid gridItems={gridItems} sx={{ flexGrow: 1 }} />
        )}
        {largeScreen ? (
          <Paper
            p="md"
            ml="md"
            sx={{
              width: '350px',
              minWidth: '350px',
              display: chatOpen ? 'block' : 'none',
            }}
          >
            <ChatPanel onClose={() => setChatOpen(false)} />
          </Paper>
        ) : (
          <ChatDrawer opened={chatOpen} onClose={() => setChatOpen(false)} />
        )}
      </Box>
      <Group position="apart" align="end" mt="md">
        <Group spacing={6} align="center">
          <Text
            fz="lg"
            fw={500}
            sx={{
              letterSpacing: 4,
            }}
          >
            {roomId}
          </Text>
          <ActionIcon onClick={copyShareLink} size="lg">
            <TbShare2 size={18} />
          </ActionIcon>
        </Group>
        <Group position="center" align="center">
          <ActionIcon
            size="xl"
            variant="filled"
            color={handRaised ? 'yellow' : 'gray'}
            onClick={toggleHandRaise}
          >
            <TbHandStop size={24} />
          </ActionIcon>
          <ReactionSelector onReaction={(r) => client.sendReaction(r)} />
          <ActionIcon
            size="xl"
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
          <ActionIcon
            size="xl"
            variant="filled"
            onClick={() => setChatOpen((prev) => !prev)}
          >
            <TbMessage size={24} />
          </ActionIcon>
        </Group>
        <Button color="red" leftIcon={<TbPhoneX size={16} />} onClick={endCall}>
          End Call
        </Button>
      </Group>
    </Container>
  );
}

export type { Peer, PeerID, StreamID };
export default CallPage;
