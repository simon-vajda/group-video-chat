import { Box, Center, Container, Title, useMantineTheme } from '@mantine/core';
import Layout from './Layout';
import { useMediaQuery } from '@mantine/hooks';

function PageNotFound() {
  const theme = useMantineTheme();
  const smallScreen = useMediaQuery('(max-width: 35rem)');
  return (
    <Layout>
      <Container>
        <Center pt="xl">
          <Box sx={{ textAlign: 'center' }}>
            <Title fz={smallScreen ? '7rem' : '10rem'} c={theme.colors.dark[4]}>
              404
            </Title>
            <Title fz="2rem" c="dimmed">
              Page not found
            </Title>
          </Box>
        </Center>
      </Container>
    </Layout>
  );
}

export default PageNotFound;
