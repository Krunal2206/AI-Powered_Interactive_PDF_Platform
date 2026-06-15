import Navbar from '@/components/DashboardPage/Navbar';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ClerkLoaded } from '@clerk/nextjs'

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ClerkLoaded>
      <ErrorBoundary section="Dashboard">
        <Navbar />
        {children}
      </ErrorBoundary>
    </ClerkLoaded>
  );
}

export default DashboardLayout;
