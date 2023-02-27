import { MantineProvider, MantineTheme } from '@mantine/core';
import { NotificationsProvider } from '@mantine/notifications';
import { Provider } from 'react-redux';
import store from './state/store';
import Room from './components/Room';

function App() {
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
          <Room />
        </NotificationsProvider>
      </MantineProvider>
    </Provider>
  );
}

export default App;
