import { useEffect } from "react";
import {
  HashRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation
} from "react-router-dom";
import { AppProvider, useApp } from "./store/AppStore";
import { TabBar } from "./components/TabBar";
import { Toast } from "./components/ui";
import { SignIn } from "./screens/SignIn";
import { PlayHome } from "./screens/PlayHome";
import { NewRound } from "./screens/NewRound";
import { PlayerPicker } from "./screens/PlayerPicker";
import { Scoring } from "./screens/Scoring";
import { RoundFinish } from "./screens/RoundFinish";
import { History } from "./screens/History";
import { RoundDetail } from "./screens/RoundDetail";
import { Courses } from "./screens/Courses";
import { CourseDetail } from "./screens/CourseDetail";
import { Stats } from "./screens/Stats";
import { Social } from "./screens/Social";
import { Profile } from "./screens/Profile";
import { Settings } from "./screens/Settings";
import { Premium } from "./screens/Premium";
import { Tournaments } from "./screens/Tournaments";
import { TournamentDetail } from "./screens/TournamentDetail";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function TabShell() {
  return (
    <div className="mx-auto min-h-screen max-w-[600px] pb-24">
      <Outlet />
      <TabBar />
    </div>
  );
}

function FullShell() {
  return (
    <div className="mx-auto min-h-screen max-w-[600px]">
      <Outlet />
    </div>
  );
}

function Router() {
  const { authed } = useApp();

  if (!authed) {
    return <SignIn />;
  }

  return (
    <Routes>
      <Route element={<TabShell />}>
        <Route path="/" element={<PlayHome />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/:id" element={<CourseDetail />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/social" element={<Social />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/history" element={<History />} />
        <Route path="/history/:id" element={<RoundDetail />} />
        <Route path="/tournaments" element={<Tournaments />} />
        <Route path="/tournaments/:id" element={<TournamentDetail />} />
      </Route>
      <Route element={<FullShell />}>
        <Route path="/play/new" element={<NewRound />} />
        <Route path="/play/players" element={<PlayerPicker />} />
        <Route path="/round" element={<Scoring />} />
        <Route path="/round/finish" element={<RoundFinish />} />
        <Route path="/premium" element={<Premium />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <ScrollToTop />
        <Router />
        <Toast />
      </HashRouter>
    </AppProvider>
  );
}
