/* eslint-disable react-hooks/exhaustive-deps */
import {
  Button,
  Container,
  createStyles,
  Divider,
  Group,
  Input,
  PinInput,
  rem,
  Stack,
  Text,
  Transition,
  useMantineTheme,
} from '@mantine/core';
import { useEffect, useState } from 'react';
import { TbKey, TbVideoPlus } from 'react-icons/tb';
import { useNavigate } from 'react-router-dom';
import { useLazyCheckRoomQuery } from '../api/roomApi';
import Layout from './Layout';

const useStyles = createStyles((theme) => ({
  title: {
    fontSize: rem(46),
    fontWeight: 900,
    lineHeight: 1.2,
    margin: 0,
    padding: 0,
    marginTop: theme.spacing.xl,
    color: theme.white,

    [theme.fn.smallerThan('xs')]: {
      fontSize: rem(36),
    },
  },

  description: {
    fontSize: rem(20),
    marginTop: theme.spacing.xl,

    [theme.fn.smallerThan('xs')]: {
      fontSize: rem(18),
    },
  },
}));

function HomePage() {
  const navigate = useNavigate();
  const theme = useMantineTheme();
  const { classes } = useStyles();

  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const [checkRoom, response] = useLazyCheckRoomQuery();
  const { isSuccess, data: roomExists, isError, isLoading } = response;

  function handlePinChange(s: string) {
    setPin(s);
    setError('');
  }

  function joinRoom(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pin.length !== 6) {
      setError('Room id must be 6 digits long');
      return;
    }
    checkRoom(pin);
  }

  useEffect(() => {
    if (isSuccess && !isLoading) {
      if (roomExists) {
        navigate(`/room/${pin}`);
      } else {
        setError('Room does not exist');
      }
    }

    if (isError) {
      setError('Something went wrong');
    }
  }, [response]);

  return (
    <Layout>
      <Container
        size={700}
        sx={{
          textAlign: 'center',
        }}
      >
        <h1 className={classes.title}>
          One easy place for{' '}
          <Text
            component="span"
            variant="gradient"
            gradient={{ from: 'blue', to: 'cyan' }}
            inherit
          >
            video calls and chat
          </Text>{' '}
          with your friends.
        </h1>
        <Text color="dimmed" className={classes.description}>
          You can create a room and invite your friends to join the room. You
          can also join a room by entering the room id.
        </Text>
        <Stack mt={52} spacing={theme.spacing.xl}>
          <Button
            variant="gradient"
            gradient={{ from: 'indigo', to: 'cyan' }}
            size="md"
            leftIcon={<TbVideoPlus size={22} />}
          >
            Create a room
          </Button>
          <Divider label="OR" labelPosition="center" />
          <form onSubmit={joinRoom}>
            <Stack>
              <Group position="center" sx={{ position: 'relative' }}>
                <PinInput
                  size="lg"
                  length={6}
                  type="number"
                  value={pin}
                  onChange={handlePinChange}
                  error={error !== ''}
                  disabled={isLoading}
                />
              </Group>
              <Button
                type="submit"
                leftIcon={<TbKey size={22} />}
                size="md"
                loading={isLoading}
              >
                Join
              </Button>
              <Transition
                mounted={error !== ''}
                transition="fade"
                timingFunction="ease"
              >
                {(styles) => <Input.Error style={styles}>{error}</Input.Error>}
              </Transition>
            </Stack>
          </form>
        </Stack>
      </Container>
    </Layout>
  );
}

export default HomePage;
