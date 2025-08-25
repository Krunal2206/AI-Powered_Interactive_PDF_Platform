import HomeNavbar from "@/components/HomePage/HomeNavbar";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <HomeNavbar />
      <main>{children}</main>
    </>
  );
}
