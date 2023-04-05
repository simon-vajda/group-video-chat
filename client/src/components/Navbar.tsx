import {
  Button,
  Container,
  Group,
  Header,
  Text,
  useMantineTheme,
} from '@mantine/core';
import { HiVideoCamera } from 'react-icons/hi';
import { useSelector } from 'react-redux';
import { selectUser } from '../state/userSlice';
import { Link } from 'react-router-dom';
import UserMenu from './UserMenu';

export default function Navbar() {
  const theme = useMantineTheme();
  const user = useSelector(selectUser);
  const loggedIn = user.name !== '';

  return (
    <Header
      height={60}
      withBorder={false}
      sx={{
        backgroundColor: theme.colors.dark[6],
      }}
    >
      <Container
        sx={{
          height: '100%',
          width: '100%',
          alignItems: 'center',
          display: 'flex',
          flexDirection: 'row',
        }}
      >
        <Group
          position="apart"
          sx={{
            width: '100%',
          }}
        >
          <Link
            to="/"
            style={{
              textDecoration: 'none',
              color: theme.colors.dark[0],
            }}
          >
            <Group spacing="xs">
              <HiVideoCamera size={28} />
              <Text fw="bold" fz="lg">
                Video Chat
              </Text>
            </Group>
          </Link>

          {loggedIn ? (
            <UserMenu />
          ) : (
            <Group spacing="sm">
              <Link to="/login">
                <Button variant="subtle">Login</Button>
              </Link>
              <Link to="/signup">
                <Button variant="gradient">Sign Up</Button>
              </Link>
            </Group>
          )}
        </Group>
      </Container>
    </Header>
  );
}
