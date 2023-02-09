import CallDemo from './CallDemo';
import { MantineProvider } from '@mantine/core';
import CallPage from './components/CallPage';

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
        },
      }}
    >
      <CallPage />
    </MantineProvider>
  );
}

export default App;
