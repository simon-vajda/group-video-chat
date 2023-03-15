import { MantineProvider, MantineTheme } from '@mantine/core';
import { NotificationsProvider } from '@mantine/notifications';
import { Provider } from 'react-redux';
import store from './state/store';
import Room from './components/Room';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

function App() {
  const router = createBrowserRouter([
    {
      errorElement: <h1>404</h1>,
      children: [
        {
          path: '/',
          element: <h1>Home</h1>,
        },
        {
          path: 'room/:id',
          element: <Room />,
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
            Button: {
              defaultProps: {
                radius: 'xl',
              },
            },
            UnstyledButton: {
              defaultProps: {
                borderRadius: 'xl',
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
          },
        }}
      >
        <NotificationsProvider>
          <RouterProvider router={router} />
        </NotificationsProvider>
      </MantineProvider>
    </Provider>
  );
}

export default App;
