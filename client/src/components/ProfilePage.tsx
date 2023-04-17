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
import { useSelector } from 'react-redux';
import { selectUser } from '../state/userSlice';
import { useForm } from '@mantine/form';
import { TbArrowBarUp, TbLogin } from 'react-icons/tb';
import { useEffect } from 'react';
import { notifications } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom';

function ProfilePage() {
  const navigate = useNavigate();
  const user = useSelector(selectUser);

  const form = useForm({
    initialValues: {
      name: user.name,
      password: '',
      passwordAgain: '',
      currentPassword: '',
    },
    validate: {
      name: (value) => {
        if (!value) return null;
        return value.length < 3
          ? 'Name must be at least 3 characters long'
          : null;
      },
      password: (value) => {
        if (!value) return null;

        if (value.length < 8) {
          return 'Password must be at least 8 characters long';
        }
        if (!/\d/.test(value)) {
          return 'Password must contain at least one number';
        }

        return null;
      },
    },
  });

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    form.validate();
    if (form.values.password !== form.values.passwordAgain) {
      form.setFieldError('passwordAgain', 'Passwords do not match');
      return;
    }

    if (!form.isValid()) return;

    console.log(form.values);
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
  }, []);

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
              {...form.getInputProps('password')}
            />
            <PasswordInput
              label="New password again"
              placeholder="New password again"
              size="md"
              {...form.getInputProps('passwordAgain')}
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
                (!form.values.name && !form.values.password)
              }
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
