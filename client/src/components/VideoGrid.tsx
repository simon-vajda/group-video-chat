/* eslint-disable react-hooks/exhaustive-deps */
import {
  AspectRatio,
  Box,
  Center,
  ColProps,
  Grid,
  Overlay,
  Paper,
  Stack,
  Sx,
  Text,
  Title,
  Transition,
  useMantineTheme,
} from '@mantine/core';
import { TbUser } from 'react-icons/tb';
import { GridItem } from '../hooks/useGridItems';
import Emoji from './Emoji';
import { getSymbol } from './ReactionSelector';
import Video from './Video';

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

  return (
    <Grid
      justify="center"
      sx={{
        padding: 0,
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
          }}
        >
          {item.stream !== null ? (
            <>
              <Box
                key={ind}
                sx={{
                  height: '100%',
                  width: '100%',
                  position: 'relative',
                  transition: 'all 0.2s ease',
                  borderRadius: theme.radius.md,
                  outline: item.peer.handRaised
                    ? '3px solid ' + theme.colors.yellow[8]
                    : undefined,
                }}
              >
                <Video item={item} />
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: theme.spacing.sm,
                    left: theme.spacing.sm,
                    borderRadius: theme.radius.md,
                    backgroundColor: theme.colors.dark[7] + 'C8',
                    paddingLeft: 10,
                    paddingRight: 10,
                    paddingTop: 4,
                    paddingBottom: 4,
                    zIndex: 300,
                  }}
                >
                  <Text>
                    {item.peer.id === 'local' ? 'Me' : item.peer.name}
                  </Text>
                </Box>
                {item.peer.handRaised && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: theme.spacing.sm,
                      left: theme.spacing.sm,
                      zIndex: 300,
                    }}
                  >
                    <Emoji symbol="✋" label="hand raised" size={24} shadow />
                  </Box>
                )}
                <Transition
                  mounted={item.peer.reaction.timeLeft > 0}
                  transition="fade"
                  timingFunction="ease"
                >
                  {(styles) => (
                    <Box
                      style={{
                        ...styles,
                        width: '100%',
                        height: '100%',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                      }}
                    >
                      <Emoji
                        symbol={getSymbol(item.peer.reaction.value)}
                        label={item.peer.reaction.value}
                        size={64}
                        shadow
                        style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          zIndex: 300,
                        }}
                      />
                      <Overlay
                        color="black"
                        opacity={0.4}
                        sx={{
                          borderRadius: theme.radius.md,
                        }}
                      />
                    </Box>
                  )}
                </Transition>
              </Box>
            </>
          ) : (
            <AspectRatio ratio={16 / 9} sx={{ height: '100%', width: '100%' }}>
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
  );
}

export default VideoGrid;
