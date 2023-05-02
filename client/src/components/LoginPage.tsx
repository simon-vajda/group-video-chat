/* eslint-disable react-hooks/exhaustive-deps */
import {
  Anchor,
  Button,
  Checkbox,
  Container,
  PasswordInput,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import Layout from './Layout';
import { useForm } from '@mantine/form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLoginMutation } from '../api/authApi';
import { useDispatch, useSelector } from 'react-redux';
import { logout, selectUser, setUser } from '../state/userSlice';
import { useEffect } from 'react';
import jwtDecode from 'jwt-decode';
import { notifications } from '@mantine/notifications';
import { TbLogout } from 'react-icons/tb';

export interface JwtPayload {
  id: string;
  name: string;
  email: string;
  iat?: number;
  exp?: number;
}

function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const [login, result] = useLoginMutation();

  const form = useForm({
    initialValues: {
      email: location.state?.email || '',
      password: '',
      keepLoggedIn: false,
    },
    validate: {
      email: (value) =>
        /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value) ? null : 'Invalid email',
    },
  });

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    form.validate();

    if (form.isValid()) {
      login(form.values)
        .unwrap()
        .then(({ token }) => {
          const { id, name, email, exp } = jwtDecode<JwtPayload>(token);
          dispatch(
            setUser({
              id,
              name,
              email,
              token,
            }),
          );

          if (exp) {
            const expires = new Date(exp * 1000);
            setTimeout(() => {
              dispatch(logout());
              notifications.show({
                title: 'Session expired',
                message:
                  'You have been logged out because your session expired',
                color: 'red',
                icon: <TbLogout size={20} />,
              });
            }, expires.getTime() - Date.now());
          }
        })
        .catch((error) => {
          if (error.status === 401) {
            form.setFieldError('password', 'Incorrect password');
          }
          if (error.status === 404) {
            form.setFieldError(
              'email',
              'We could not find an account with this email',
            );
          }
        });
    }
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
          Welcome back!
        </Title>

        <form onSubmit={onSubmit}>
          <TextInput
            label="Email address"
            placeholder="you@example.com"
            size="md"
            required
            autoFocus={location.state?.email ? false : true}
            {...form.getInputProps('email')}
          />
          <PasswordInput
            label="Password"
            placeholder="Your password"
            mt="md"
            size="md"
            required
            autoFocus={location.state?.email ? true : false}
            {...form.getInputProps('password')}
          />
          <Checkbox
            label="Keep me logged in"
            mt="xl"
            size="md"
            {...form.getInputProps('keepLoggedIn', { type: 'checkbox' })}
          />
          <Button
            fullWidth
            mt="xl"
            size="md"
            type="submit"
            loading={result.isLoading}
          >
            Login
          </Button>

          <Text ta="center" mt="md">
            Don&apos;t have an account?{' '}
            <Anchor component={Link} to="/signup" weight={700}>
              Sign Up
            </Anchor>
          </Text>
        </form>
      </Container>
    </Layout>
  );
}

export default LoginPage;
