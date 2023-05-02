/* eslint-disable react-hooks/exhaustive-deps */
import {
  Box,
  Center,
  Container,
  Loader,
  Paper,
  useMantineTheme,
} from '@mantine/core';
import { useEffect, useRef, useState } from 'react';
import { TbMessage } from 'react-icons/tb';
import { useDispatch, useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import RtcClient from '../rtcClient';
import { selectUser } from '../state/userSlice';
import VideoGrid from './VideoGrid';
import { useParams } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { Reaction } from './ReactionSelector';
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
  setHandRaisedCount,
} from '../state/callSlice';
import { ChatItem } from '../state/callSlice';
import ControlBar from './ControlBar';
import { selectUserMedia } from '../state/userMediaSlice';

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

const REACTION_TIMEOUT = 2000;
const NOTIFICATION_TIMEOUT = 3000;

function initClient(): RtcClient {
  const socket = io(getServerUrl(), { path: '/api/socket.io' });
  return new RtcClient(socket);
}

function CallPage() {
  const [client] = useState<RtcClient>(initClient());
  const [streams, setStreams] = useState<MediaStream[]>([]);
  const [peers, setPeers] = useState<Map<PeerID, Peer>>(new Map());
  const [streamOwners, setStreamOwners] = useState<Map<StreamID, PeerID>>(
    new Map(),
  );
  const [loading, setLoading] = useState(true);
  const [localStream, setLocalStream] = useState<MediaStream>(
    new MediaStream(),
  );
  const localStreamRef = useRef(localStream);

  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const userMedia = useSelector(selectUserMedia);
  const { chatOpen } = useSelector(selectCall);
  const { id: roomId } = useParams();

  const gridItems = useGridItems(streams, peers, streamOwners);
  const theme = useMantineTheme();
  const largeScreen = useMediaQuery(`(min-width: ${theme.breakpoints.sm})`);
  useMuter(localStream);

  async function initMedia(pc: RTCPeerConnection) {
    const localPeer: Peer = {
      id: 'local',
      name: user.name,
      index: -1,
      handRaised: false,
      reaction: { value: 'like', timeLeft: 0 },
    };
    setPeers((prev) => new Map(prev).set('local', localPeer));

    try {
      const media = await navigator.mediaDevices.getUserMedia({
        audio: userMedia.audioDeviceId
          ? { deviceId: userMedia.audioDeviceId }
          : true,
        video: userMedia.videoDeviceId
          ? { deviceId: userMedia.videoDeviceId }
          : { facingMode: 'user' },
      });
      console.log('Local stream', media);
      media.getTracks().forEach((track) => {
        pc.addTrack(track, media);
      });

      setLocalStream(media);
      setStreams((prev) => [...prev, media]);
      setStreamOwners((prev) => new Map(prev).set(media.id, 'local'));
      localStreamRef.current = media;
    } catch (err) {
      console.error('Failed to get local stream');
      pc.addTransceiver('audio', { direction: 'recvonly' });
      pc.addTransceiver('video', { direction: 'recvonly' });
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
      (peerList: Peer[], ownerList: StreamOwner[], messageList: ChatItem[]) => {
        console.log('Peers in room already', peerList);
        console.log('Messages in room already', messageList);

        setPeers((prev) => {
          const newPeers = new Map(prev);

          peerList.forEach((peer) => {
            peer.reaction = { value: 'like', timeLeft: 0 };
            newPeers.set(peer.id, peer);
          });

          const handRaisedCount = peerList.filter((p) => p.handRaised).length;
          dispatch(setChatItems(messageList));
          dispatch(setHandRaisedCount(handRaisedCount));

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
      onReaction(reaction, peerId);
    });

    socket.emit('join', user.name, roomId);

    return () => {
      socket.off();
      socket.disconnect();
      pc.close();
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    };
  }, []);

  useEffect(() => {
    client.socket.on('message', (chatItem: ChatItem) => {
      console.log('Message received', chatItem);
      dispatch(addChatItem(chatItem));

      if (!chatOpen) {
        notifications.show({
          title: chatItem.author,
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
    });

    return () => {
      client.socket.off('message');
    };
  }, [chatOpen]);

  function truncate(str: string, n: number) {
    return str.length > n ? str.substring(0, n - 1) + '...' : str;
  }

  function removeReaction(peerId: PeerID) {
    setPeers((prev) => {
      const newPeers = new Map(prev);
      const peer = deepCopy(newPeers.get(peerId));
      if (peer) {
        peer.reaction.timeLeft--;
        newPeers.set(peerId, peer);
      }
      return newPeers;
    });
  }

  function sendMessage(message: string) {
    client.sendMessage(message);
  }

  function closeChat() {
    dispatch(setChatOpen(false));
  }

  function onReaction(reaction: Reaction, peerId: PeerID) {
    setPeers((prev) => {
      const newPeers = new Map(prev);
      const peer = deepCopy(newPeers.get(peerId));
      if (peer) {
        if (reaction === 'hand-up') {
          peer.handRaised = true;
        } else if (reaction === 'hand-down') {
          peer.handRaised = false;
        } else {
          peer.reaction.value = reaction;
          peer.reaction.timeLeft++;

          setTimeout(() => {
            removeReaction(peerId);
          }, REACTION_TIMEOUT);
        }
        newPeers.set(peerId, peer);
      }

      const handRaisedCount = Array.from(newPeers.values()).filter(
        (p) => p.handRaised,
      ).length;
      dispatch(setHandRaisedCount(handRaisedCount));

      return newPeers;
    });
  }

  function deepCopy<T>(obj: T): T | undefined {
    if (obj === undefined || obj === null) return undefined;
    return structuredClone(obj);
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
      <ControlBar
        rtcClient={client}
        onReaction={(r) => onReaction(r, 'local')}
      />
    </Container>
  );
}

export type { Peer, PeerID, StreamID };
export default CallPage;
