/* eslint-disable react-hooks/exhaustive-deps */
import {
  ActionIcon,
  Button,
  Center,
  Container,
  Divider,
  Group,
  Loader,
  Text,
} from '@mantine/core';
import { useEffect, useState } from 'react';
import {
  TbMicrophone,
  TbMicrophoneOff,
  TbVideo,
  TbVideoOff,
  TbPhoneX,
  TbShare3,
  TbShare,
  TbShare2,
  TbHandStop,
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
import ReactionSelector from './ReactionSelector';

interface Peer {
  id: string;
  name: string;
  index: number;
}

interface GridItem {
  peer: Peer;
  stream: MediaStream | null;
}

interface StreamOwner {
  streamId: string;
  peerId: string;
}

function CallPage() {
  const { id: roomId } = useParams();
  const navigate = useNavigate();

  const [localStream, setLocalStream] = useState<MediaStream>(
    new MediaStream(),
  );
  const [peers, setPeers] = useState<Map<string, Peer>>(new Map());
  const [streamOwners, setStreamOwners] = useState<Map<string, string>>(
    new Map(),
  );
  const [streams, setStreams] = useState<MediaStream[]>([]);
  const [gridItems, setGridItems] = useState<GridItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [handRaised, setHandRaised] = useState(false);

  const dispatch = useDispatch();
  const userMedia = useSelector(selectUserMedia);
  const user = useSelector(selectUser);

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
        const localPeer: Peer = {
          id: 'local',
          name: user.name,
          index: 0,
        };

        setLocalStream(stream);
        setPeers((prev) => new Map(prev).set('local', localPeer));
        setStreams((prev) => [...prev, stream]);
        setStreamOwners((prev) => new Map(prev).set(stream.id, 'local'));
      })
      .finally(() => {
        setLoading(false);
      });
  }

  useEffect(() => {
    const socket =
      !process.env.NODE_ENV || process.env.NODE_ENV === 'development'
        ? io('http://localhost:5000')
        : io();
    const client = new RtcClient(socket);
    let peerIndex = 1;

    client.connection.ontrack = (event) => {
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

    socket.on('peer-joined', (id: string, name: string) => {
      console.info('Peer joined', name, id);
      const peer: Peer = {
        id,
        name,
        index: peerIndex++,
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

    socket.emit('join', user.name, roomId);
    console.log('Joining room', roomId);

    return () => {
      socket.off();
      socket.disconnect();
      localStream.getTracks().forEach((track) => track.stop());
      client.connection.close();
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
    const items: GridItem[] = [];
    const peersWithoutStream = new Set(peers.values());

    streams.forEach((stream) => {
      const peerId = streamOwners.get(stream.id);
      if (peerId) {
        const peer = peers.get(peerId);
        if (peer) {
          items.push({
            peer,
            stream,
          });
          peersWithoutStream.delete(peer);
        }
      }
    });

    peersWithoutStream.forEach((peer) => {
      items.push({
        peer,
        stream: null,
      });
    });

    items.sort((a, b) => {
      if (a.peer.id === 'local') {
        return -1;
      }
      if (b.peer.id === 'local') {
        return 1;
      }
      if (a.stream && !b.stream) {
        return -1;
      }
      if (!a.stream && b.stream) {
        return 1;
      }

      return a.peer.index - b.peer.index;
    });
    setGridItems(items);
  }, [streams, streamOwners, peers]);

  const endCall = () => {
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
      {loading ? (
        <Center
          sx={{
            flexGrow: 1,
          }}
        >
          <Loader />
        </Center>
      ) : (
        <VideoGrid gridItems={gridItems} sx={{ flexGrow: 1 }} />
      )}
      <Group position="apart" align="end" mt="md">
        <Group spacing={8} align="center">
          <Text
            fz="lg"
            fw={500}
            sx={{
              letterSpacing: 4,
            }}
          >
            {roomId}
          </Text>
          <ActionIcon onClick={copyShareLink}>
            <TbShare2 size={18} />
          </ActionIcon>
        </Group>
        <Group position="center" align="center">
          <ActionIcon
            size="xl"
            variant="filled"
            color={handRaised ? 'yellow' : 'gray'}
            onClick={() => setHandRaised((v) => !v)}
          >
            <TbHandStop size={24} />
          </ActionIcon>
          <ReactionSelector />
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
        </Group>
        <Button color="red" leftIcon={<TbPhoneX size={16} />} onClick={endCall}>
          End Call
        </Button>
      </Group>
    </Container>
  );
}

export type { Peer, GridItem };
export default CallPage;
