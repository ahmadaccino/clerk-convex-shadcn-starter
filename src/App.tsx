import { Route, Routes } from "react-router";
import HomePage from "./pages/home";
import RepaymentPage from "./pages/repayment";
import SubscriptionPage from "./pages/subscription";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/subscription" element={<SubscriptionPage />} />
      <Route path="/repayment" element={<RepaymentPage />} />
    </Routes>
  );
}
