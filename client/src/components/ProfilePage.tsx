/* eslint-disable react-hooks/exhaustive-deps */
import {
  Avatar,
  Box,
  Button,
  Center,
  Container,
  Divider,
  Grid,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import Layout from './Layout';
import { useDispatch, useSelector } from 'react-redux';
import { selectUser, setUsername } from '../state/userSlice';
import { useForm } from '@mantine/form';
import { TbArrowBarUp, TbCheck, TbLogin } from 'react-icons/tb';
import { useEffect } from 'react';
import { notifications } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom';
import { useUpdateAccountMutation } from '../api/accountApi';

const passwordRegex = /^(?=.*\D)(?=.*\d).+$/;

function ProfilePage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const [updateAccount, { isLoading }] = useUpdateAccountMutation();

  const form = useForm({
    initialValues: {
      name: user.name,
      newPassword: '',
      newPasswordAgain: '',
      currentPassword: '',
    },
    validate: {
      name: (value) => {
        if (!value) return null;
        return value.length < 3
          ? 'Name must be at least 3 characters long'
          : null;
      },
      newPassword: (value) => {
        if (!value) return null;

        if (value.length < 8) {
          return 'Password must be at least 8 characters long';
        }
        if (!passwordRegex.test(value)) {
          return 'Password must contain at least one number and one letter';
        }

        return null;
      },
    },
  });

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const { name, newPassword, newPasswordAgain, currentPassword } =
      form.values;
    form.validate();
    if (newPassword !== newPasswordAgain) {
      form.setFieldError('newPasswordAgain', 'Passwords do not match');
      return;
    }

    if (!form.isValid()) return;

    const body = {
      name: name || undefined,
      newPassword: newPassword || undefined,
      currentPassword: currentPassword,
    };
    updateAccount({ body, token: user.token })
      .unwrap()
      .then(() => {
        if (name && name !== user.name) {
          dispatch(setUsername(name));
        }

        notifications.show({
          title: 'Account updated',
          message: 'Your account has been updated',
          color: 'green',
          icon: <TbCheck size={20} />,
        });

        form.reset();
      })
      .catch((response) => {
        if (response.status === 401) {
          form.setFieldError('currentPassword', 'Incorrect password');
        }
      });
  }

  useEffect(() => {
    if (!user.token) {
      navigate('/login', { replace: true });
      notifications.show({
        title: 'Authentication needed',
        message: 'Please log in to view this page',
        color: 'yellow',
        icon: <TbLogin size={20} />,
      });
    }
  }, [user]);

  return (
    <Layout>
      <Container size="sm">
        <Grid justify="center" gutter={0}>
          <Grid.Col span={12} xs="content">
            <Center>
              <Avatar
                radius="50%"
                color="primary"
                size="4.5rem"
                ml="sm"
                mr="sm"
              >
                {user.name[0]?.toUpperCase()}
              </Avatar>
            </Center>
          </Grid.Col>
          <Grid.Col span={12} xs="content">
            <Box
              sx={{
                '@media (max-width: 36rem)': {
                  textAlign: 'center',
                },
              }}
            >
              <Title>{user.name}</Title>
              <Text c="dimmed">{user.email}</Text>
            </Box>
          </Grid.Col>
        </Grid>
        <Divider mt="md" mb="md" />
        <form onSubmit={onSubmit}>
          <Stack spacing="sm">
            <TextInput
              label="Name"
              placeholder="Your display name"
              size="md"
              {...form.getInputProps('name')}
            />
            <PasswordInput
              label="New password"
              placeholder="New password"
              size="md"
              {...form.getInputProps('newPassword')}
            />
            <PasswordInput
              label="New password again"
              placeholder="New password again"
              size="md"
              {...form.getInputProps('newPasswordAgain')}
            />

            <PasswordInput
              label="Current password"
              placeholder="Your current password"
              size="md"
              mt="xl"
              required
              {...form.getInputProps('currentPassword')}
            />
            <Button
              type="submit"
              size="md"
              leftIcon={<TbArrowBarUp size={20} />}
              disabled={
                !form.values.currentPassword ||
                (!form.values.name && !form.values.newPassword)
              }
              loading={isLoading}
            >
              Update profile
            </Button>
          </Stack>
        </form>
      </Container>
    </Layout>
  );
}

export default ProfilePage;
