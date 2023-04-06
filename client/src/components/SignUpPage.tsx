import {
  Anchor,
  Button,
  Checkbox,
  Container,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import Layout from './Layout';
import { useForm } from '@mantine/form';
import { Link } from 'react-router-dom';

function SignUpPage() {
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

    if (!form.isValid()) return;

    if (form.values.password !== form.values.passwordAgain) {
      form.setFieldError('passwordAgain', 'Passwords do not match');
    } else {
      console.log('Form is valid');
    }
  }

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
          <Button fullWidth mt="xl" size="md" type="submit">
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
