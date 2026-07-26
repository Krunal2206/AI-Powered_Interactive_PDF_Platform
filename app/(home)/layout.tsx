import HomeNavbar from "@/components/HomePage/HomeNavbar";
import Footer from "@/components/Footer";

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <HomeNavbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}
