/* eslint-disable react-hooks/exhaustive-deps */
import { ColProps, Grid, Sx } from '@mantine/core';
import { useMemo } from 'react';

interface VideoGridProps {
  streams: MediaStream[];
  localStream?: MediaStream;
  sx?: Sx;
}

function VideoGrid({ streams, localStream, sx }: VideoGridProps) {
  function getGridColSize(): ColProps {
    switch (streams.length) {
      case 1:
        return {
          span: 12,
          xs: 12,
          sm: 12,
          md: 12,
          lg: 10,
          xl: 8,
        };
      case 2:
        return {
          span: 12,
          xs: 12,
          sm: 8,
          md: 8,
          lg: 6,
          xl: 6,
        };
      case 3:
        return {
          span: 12,
          xs: 10,
          sm: 8,
          md: 6,
          lg: 6,
          xl: 4,
        };
      case 4:
        return {
          span: 12,
          xs: 6,
          sm: 6,
          md: 6,
          lg: 5,
          xl: 5,
        };
      case 5:
        return {
          span: 12,
          xs: 6,
          sm: 6,
          md: 5,
          lg: 4,
          xl: 4,
        };
      case 6:
        return {
          span: 12,
          xs: 6,
          sm: 6,
          md: 4,
          lg: 4,
          xl: 4,
        };
      default:
        return {
          span: 12,
          xs: 8,
          sm: 5,
          md: 4,
          lg: 4,
          xl: 3,
        };
    }
  }

  return useMemo(
    () => (
      <Grid
        justify="center"
        sx={{
          overflow: 'auto',
          ...sx,
        }}
      >
        {streams.map((stream, ind) => (
          <Grid.Col
            key={ind}
            {...getGridColSize()}
            style={{
              transition: 'all 0.3s ease',
            }}
          >
            <video
              key={ind}
              autoPlay
              playsInline
              ref={(el) => {
                if (el) {
                  el.srcObject = stream;
                }
              }}
              muted={stream.id === localStream?.id}
              style={{
                objectFit: 'cover',
                height: '100%',
                width: '100%',
                borderRadius: 8,
                aspectRatio: '16/9',
              }}
            />
          </Grid.Col>
        ))}
      </Grid>
    ),
    [streams, localStream],
  );
}

export default VideoGrid;
