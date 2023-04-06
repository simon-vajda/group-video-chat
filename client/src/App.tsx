import { MantineProvider, MantineTheme } from '@mantine/core';
import { Provider } from 'react-redux';
import store from './state/store';
import Room from './components/Room';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import HomePage from './components/HomePage';
import { Notifications } from '@mantine/notifications';
import LoginPage from './components/LoginPage';
import SignUpPage from './components/SignUpPage';

function App() {
  const router = createBrowserRouter([
    {
      errorElement: <h1>404</h1>,
      children: [
        {
          path: '/',
          element: <HomePage />,
        },
        {
          path: 'room/:id',
          element: <Room />,
        },
        {
          path: '/login',
          element: <LoginPage />,
        },
        {
          path: 'signup',
          element: <SignUpPage />,
        },
      ],
    },
  ]);

  return (
    <Provider store={store}>
      <MantineProvider
        withGlobalStyles
        withNormalizeCSS
        theme={{
          colorScheme: 'dark',
          components: {
            ActionIcon: {
              defaultProps: {
                radius: 'xl',
              },
            },
            Button: {
              defaultProps: {
                radius: 'xl',
              },
            },
            Input: {
              defaultProps: {
                radius: 'xl',
              },
            },
            Container: {
              defaultProps: {
                size: 'xl',
                py: 'md',
              },
            },
            Paper: {
              styles: (theme: MantineTheme) => ({
                root: {
                  backgroundColor: theme.colors.dark[9],
                  borderRadius: theme.radius.md,
                },
              }),
            },
            Notification: {
              defaultProps: {
                radius: 'md',
              },
            },
            Menu: {
              defaultProps: {
                radius: 'md',
                shadow: 'md',
              },
            },
          },
        }}
      >
        <Notifications />
        <RouterProvider router={router} />
      </MantineProvider>
    </Provider>
  );
}

export function getServerUrl() {
  return !process.env.NODE_ENV || process.env.NODE_ENV === 'development'
    ? 'http://localhost:15000'
    : '';
}

export default App;
