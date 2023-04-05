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
import { Link } from 'react-router-dom';

function LoginPage() {
  const form = useForm({
    initialValues: {
      email: '',
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
      console.log(form.values);
    }
  }

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
            {...form.getInputProps('email')}
          />
          <PasswordInput
            label="Password"
            placeholder="Your password"
            mt="md"
            size="md"
            required
            {...form.getInputProps('password')}
          />
          <Checkbox
            label="Keep me logged in"
            mt="xl"
            size="md"
            {...form.getInputProps('keepLoggedIn', { type: 'checkbox' })}
          />
          <Button fullWidth mt="xl" size="md" type="submit">
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
