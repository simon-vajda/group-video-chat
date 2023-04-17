import {
  Menu,
  UnstyledButton,
  Group,
  Avatar,
  useMantineTheme,
  Text,
  MediaQuery,
} from '@mantine/core';
import { useState } from 'react';
import { TbSettings, TbLogout, TbUser } from 'react-icons/tb';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { logout, selectUser } from '../state/userSlice';

function UserMenu() {
  const [open, setOpen] = useState(false);
  const theme = useMantineTheme();
  const user = useSelector(selectUser);
  const dispatch = useDispatch();

  return (
    <Menu position="bottom-end" opened={open} onChange={setOpen}>
      <Menu.Target>
        <UnstyledButton
          sx={{
            borderRadius: theme.radius.xl,
            padding: 4,
            '&:hover': {
              backgroundColor: theme.colors.dark[7],
            },
            transition: 'all 0.3s ease',
            ...(open && {
              backgroundColor: theme.colors.dark[7],
            }),
          }}
        >
          <Group position="center" spacing="xs">
            <MediaQuery smallerThan="xs" styles={{ display: 'none' }}>
              <Text ml={10} fw={500}>
                {user.name}
              </Text>
            </MediaQuery>
            <Avatar radius="xl" color="primary">
              {user.name[0].toUpperCase()}
            </Avatar>
          </Group>
        </UnstyledButton>
      </Menu.Target>
      <Menu.Dropdown>
        <Link
          to="/profile"
          style={{
            textDecoration: 'none',
            color: theme.colors.dark[0],
          }}
        >
          <Menu.Item icon={<TbUser size={14} />}>
            <MediaQuery smallerThan="xs" styles={{ display: 'none' }}>
              <Text>Profile</Text>
            </MediaQuery>
            <MediaQuery largerThan="xs" styles={{ display: 'none' }}>
              <Text>{user.name}</Text>
            </MediaQuery>
          </Menu.Item>
        </Link>
        <Menu.Divider />
        <Menu.Item
          icon={<TbLogout size={14} />}
          color={theme.colors.red[6]}
          onClick={() => dispatch(logout())}
        >
          Log out
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}

export default UserMenu;
