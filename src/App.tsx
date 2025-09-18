import { Route, Routes } from "react-router";
import HomePage from "./pages/home";
import ProfilePage from "./pages/profile";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/profile" element={<ProfilePage />} />
    </Routes>
  );
}
