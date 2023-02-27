/* eslint-disable react-hooks/exhaustive-deps */
import {
  AspectRatio,
  Box,
  Center,
  ColProps,
  Grid,
  Paper,
  Stack,
  Sx,
  Text,
  Title,
  useMantineTheme,
} from '@mantine/core';
import { CSSProperties, useMemo } from 'react';
import { TbUser } from 'react-icons/tb';
import { GridItem } from './CallPage';

interface VideoGridProps {
  gridItems: GridItem[];
  sx?: Sx;
}

function VideoGrid({ gridItems, sx }: VideoGridProps) {
  const theme = useMantineTheme();

  function getGridColSize(): ColProps {
    switch (gridItems.length) {
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
      <Grid
        justify="center"
        sx={{
          overflow: 'auto',
          ...sx,
        }}
      >
        {gridItems.map((item, ind) => (
          <Grid.Col
            key={ind}
            {...getGridColSize()}
            style={{
              transition: 'all 0.3s ease',
              position: 'relative',
            }}
          >
            {item.stream !== null ? (
              <>
                <video
                  key={ind}
                  autoPlay
                  playsInline
                  ref={(el) => {
                    if (el) {
                      el.srcObject = item.stream;
                    }
                  }}
                  muted={item.peer.id === 'local'}
                  style={
                    item.peer.id === 'local' ? localVideoStyles : videoStyles
                  }
                />
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: theme.spacing.md,
                    left: theme.spacing.md,
                    borderRadius: theme.radius.md,
                    backgroundColor: theme.colors.dark[7] + 'C8',
                    paddingLeft: 10,
                    paddingRight: 10,
                    paddingTop: 4,
                    paddingBottom: 4,
                  }}
                >
                  <Text>
                    {item.peer.id === 'local' ? 'Me' : item.peer.name}
                  </Text>
                </Box>
              </>
            ) : (
              <AspectRatio
                ratio={16 / 9}
                sx={{ height: '100%', width: '100%' }}
              >
                <Paper>
                  <Center>
                    <Stack align="center">
                      <TbUser size={80} />
                      <Title order={3}>
                        {item.peer.id === 'local' ? 'Me' : item.peer.name}
                      </Title>
                    </Stack>
                  </Center>
                </Paper>
              </AspectRatio>
            )}
          </Grid.Col>
        ))}
      </Grid>
    ),
    [gridItems],
  );
}

export default VideoGrid;
