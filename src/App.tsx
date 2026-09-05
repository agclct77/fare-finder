import { Routes, Route } from "react-router-dom";

import Index from "./pages/Index";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import AppShell from "./pages/AppShell";
import NotFound from "./pages/NotFound";
import { RequireAuth } from "./components/RequireAuth";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route
        path="/app"
        element={<RequireAuth>{(user) => <AppShell user={user} />}</RequireAuth>}
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
