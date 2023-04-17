/* eslint-disable react-hooks/exhaustive-deps */
import {
  Anchor,
  Button,
  Container,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import Layout from './Layout';
import { useForm } from '@mantine/form';
import { Link, useNavigate } from 'react-router-dom';
import { useSignupMutation } from '../api/authApi';
import { notifications } from '@mantine/notifications';
import { TbCheck } from 'react-icons/tb';
import { useSelector } from 'react-redux';
import { selectUser } from '../state/userSlice';
import { useEffect } from 'react';

function SignUpPage() {
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const [signup, result] = useSignupMutation();

  const form = useForm({
    initialValues: {
      name: '',
      email: '',
      password: '',
      passwordAgain: '',
    },
    validate: {
      name: (value) =>
        value.length < 3 ? 'Name must be at least 3 characters long' : null,
      email: (value) =>
        /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value) ? null : 'Invalid email',
      password: (value) => {
        if (value.length < 8) {
          return 'Password must be at least 8 characters long';
        }
        if (!/\d/.test(value)) {
          return 'Password must contain at least one number';
        }

        return null;
      },
      passwordAgain: (value) => {
        console.log();
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

    signup({
      name: form.values.name,
      email: form.values.email,
      password: form.values.password,
    })
      .unwrap()
      .then(() => {
        notifications.show({
          title: 'Success',
          message: 'You have successfully signed up',
          color: 'teal',
          icon: <TbCheck size={20} />,
        });
        navigate('/login', { state: { email: form.values.email } });
      })
      .catch((error) => {
        if (error.status === 409) {
          form.setFieldError('email', 'Email already in use');
        }
      });
  }

  useEffect(() => {
    if (user.token) {
      navigate('/', { replace: true });
    }
  }, [user]);

  return (
    <Layout>
      <Container size="xs" mt="xl">
        <Title ta="center" mt="md" mb={50}>
          Sign Up
        </Title>

        <form onSubmit={onSubmit}>
          <Stack spacing="md">
            <TextInput
              label="Name"
              placeholder="Your name"
              size="md"
              required
              autoFocus
              {...form.getInputProps('name')}
            />
            <TextInput
              label="Email address"
              placeholder="you@example.com"
              required
              type="email"
              {...form.getInputProps('email')}
            />
            <PasswordInput
              label="Password"
              placeholder="Your password"
              size="md"
              required
              {...form.getInputProps('password')}
            />
            <PasswordInput
              label="Password again"
              placeholder="Your password again"
              size="md"
              required
              {...form.getInputProps('passwordAgain')}
            />
          </Stack>
          <Button
            fullWidth
            mt="xl"
            size="md"
            type="submit"
            loading={result.isLoading}
          >
            Sign Up
          </Button>

          <Text ta="center" mt="md">
            Already have an account?{' '}
            <Anchor component={Link} to="/login" weight={700}>
              Login
            </Anchor>
          </Text>
        </form>
      </Container>
    </Layout>
  );
}

export default SignUpPage;
