import { useEffect, useState } from 'react';
import { Peer, PeerID, StreamID } from '../components/CallPage';

type GridItem = {
  peer: Peer;
  stream: MediaStream | null;
};

function useGridItems(
  streams: MediaStream[],
  peers: Map<PeerID, Peer>,
  owners: Map<StreamID, PeerID>,
) {
  const [gridItems, setGridItems] = useState<GridItem[]>([]);

  useEffect(() => {
    const items: GridItem[] = [];
    const peersWithoutStream = new Set(peers.values());

    streams.forEach((stream) => {
      const peerId = owners.get(stream.id);
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
  }, [streams, owners, peers]);

  return gridItems;
}

export type { GridItem };
export default useGridItems;
