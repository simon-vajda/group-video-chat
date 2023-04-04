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
import ChatDialog from './ChatDialog';
import {
  addChatItem,
  selectCall,
  setChatItems,
  setChatOpen,
  setHandRaised,
  toggleChatOpen,
} from '../state/callSlice';
import { ChatItem } from './ChatList';

type PeerID = string;
type StreamID = string;

interface Peer {
  id: PeerID;
  name: string;
  index: number;
  handRaised: boolean;
  reaction: ReactionData;
}

interface StreamOwner {
  streamId: StreamID;
  peerId: PeerID;
}

interface ReactionData {
  value: Reaction;
  timeLeft: number;
}

interface ChatItemData {
  authorId: PeerID;
  message: string;
  timeStamp: number;
}

const REACTION_TIMEOUT = 2000;
const NOTIFICATION_TIMEOUT = 3000;

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

  const dispatch = useDispatch();
  const userMedia = useSelector(selectUserMedia);
  const user = useSelector(selectUser);
  const { chatOpen, handRaised } = useSelector(selectCall);

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

    socket.on(
      'room-state',
      (
        peerList: Peer[],
        ownerList: StreamOwner[],
        messageList: ChatItemData[],
      ) => {
        console.log('Peers in room already', peerList);
        console.log('Messages in room already', messageList);

        setPeers((prev) => {
          const newPeers = new Map(prev);
          const chatItems: ChatItem[] = [];

          peerList.forEach((peer) => {
            peer.reaction = { value: 'like', timeLeft: 0 };
            newPeers.set(peer.id, peer);
          });

          messageList.forEach((m) => {
            const peer = newPeers.get(m.authorId);
            if (peer) {
              chatItems.push({
                author: peer,
                message: m.message,
                timeStamp: m.timeStamp,
              });
            }
          });
          dispatch(setChatItems(chatItems));

          return newPeers;
        });

        setStreamOwners((prev) => {
          const newOwners = new Map(prev);
          ownerList.forEach((owner) => {
            newOwners.set(owner.streamId, owner.peerId);
          });
          return newOwners;
        });
      },
    );

    socket.on('reaction', (reaction: Reaction, peerId: PeerID) => {
      console.log('Reaction received', reaction, peerId);
      setPeers((prev) => {
        const newPeers = new Map(prev);
        const peer = newPeers.get(peerId);
        if (peer) {
          const newPeer = { ...peer };
          if (reaction === 'hand-up') {
            newPeer.handRaised = true;
          } else if (reaction === 'hand-down') {
            newPeer.handRaised = false;
          } else {
            newPeer.reaction = {
              ...newPeer.reaction,
              value: reaction,
              timeLeft: newPeer.reaction.timeLeft + 1,
            };

            setTimeout(() => {
              removeReaction(peerId);
            }, REACTION_TIMEOUT);
          }
          newPeers.set(peerId, newPeer);
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

  useEffect(() => {
    client.socket.on('message', (data: ChatItemData) => {
      console.log('Message received', data);
      const peer = peers.get(data.authorId);
      if (peer) {
        const chatItem = {
          author: peer,
          message: data.message,
          timeStamp: data.timeStamp,
        };
        dispatch(addChatItem(chatItem));

        if (!chatOpen) {
          notifications.show({
            title: chatItem.author.name,
            message: truncate(chatItem.message, 60),
            icon: <TbMessage size={20} />,
            autoClose: NOTIFICATION_TIMEOUT,
            withCloseButton: false,
            sx: {
              cursor: 'pointer',
            },
            onClick: () => {
              dispatch(setChatOpen(true));
              notifications.clean();
            },
          });
        }
      }
    });

    return () => {
      client.socket.off('message');
    };
  }, [peers, chatOpen]);

  function truncate(str: string, n: number) {
    return str.length > n ? str.substring(0, n - 1) + '...' : str;
  }

  function removeReaction(peerId: PeerID) {
    setPeers((prev) => {
      const newPeers = new Map(prev);
      const peer = newPeers.get(peerId);
      if (peer) {
        const newPeer = { ...peer };
        newPeer.reaction = {
          ...newPeer.reaction,
          timeLeft: newPeer.reaction.timeLeft - 1,
        };
        newPeers.set(peerId, newPeer);
      }
      return newPeers;
    });
  }

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
    const newValue = !handRaised;
    client.sendReaction(newValue ? 'hand-up' : 'hand-down');
    dispatch(setHandRaised(newValue));
  }

  function sendMessage(message: string) {
    client.sendMessage(message);
  }

  function closeChat() {
    dispatch(setChatOpen(false));
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
            ml="md"
            sx={{
              width: '350px',
              minWidth: '350px',
              display: chatOpen ? 'block' : 'none',
            }}
          >
            <ChatPanel onSubmit={sendMessage} onClose={closeChat} />
          </Paper>
        ) : (
          <ChatDialog
            opened={chatOpen}
            onSubmit={sendMessage}
            onClose={closeChat}
          />
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
            onClick={() => dispatch(toggleChatOpen())}
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
