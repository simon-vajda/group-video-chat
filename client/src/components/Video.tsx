/* eslint-disable react-hooks/exhaustive-deps */
import { useMantineTheme } from '@mantine/core';
import { CSSProperties, useMemo } from 'react';
import { GridItem } from '../hooks/useGridItems';

type VideoProps = {
  item: GridItem;
};

function Video({ item }: VideoProps) {
  const theme = useMantineTheme();

  const videoStyles: CSSProperties = {
    objectFit: 'cover',
    height: '100%',
    width: '100%',
    borderRadius: theme.radius.md,
    aspectRatio: '16/9',
  };

  const localVideoStyles: CSSProperties = {
    ...videoStyles,
    transform: 'scaleX(-1)',
    WebkitTransform: 'scaleX(-1)',
  };

  return useMemo(
    () => (
      <video
        autoPlay
        playsInline
        ref={(el) => {
          if (el) {
            el.srcObject = item.stream;
          }
        }}
        muted={item.peer.id === 'local'}
        style={item.peer.id === 'local' ? localVideoStyles : videoStyles}
      />
    ),
    [item.stream],
  );
}

export default Video;
