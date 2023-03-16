import { Box } from '@mantine/core';
import Navbar from './Navbar';

type LayoutProps = {
  children: React.ReactNode;
};

function Layout({ children }: LayoutProps) {
  return (
    <Box h="100%">
      <Navbar />
      {children}
    </Box>
  );
}

export default Layout;
