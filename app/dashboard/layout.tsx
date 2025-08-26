import Navbar from '@/components/DashboardPage/Navbar';
import { ClerkLoaded } from '@clerk/nextjs'

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ClerkLoaded>
      <Navbar />
      {children}
    </ClerkLoaded>
  )
}

export default DashboardLayout;
