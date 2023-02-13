import CallDemo from './CallDemo';
import { MantineProvider, MantineTheme } from '@mantine/core';
import CallPage from './components/CallPage';
import JoinScreen from './components/JoinScreen';
import { NotificationsProvider } from '@mantine/notifications';

function App() {
  return (
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
                backgroundColor: theme.colors.dark[8],
              },
            }),
          },
        },
      }}
    >
      <NotificationsProvider>
        <JoinScreen />
      </NotificationsProvider>
    </MantineProvider>
  );
}

export default App;
