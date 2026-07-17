import BottomNav from "./BottomNav";

export default function MainLayout({ children }) {
  return (
    <>
      {children}
      <BottomNav />
    </>
  );
}
