import { useState } from "react";
import { Crown, LogOut, Moon, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../store/AppStore";
import { Card, LargeTitle, SectionLabel, SegmentedControl } from "../components/ui";

export function Settings() {
  const navigate = useNavigate();
  const { themePref, setThemePref, signOut, resetDemoData, premium } = useApp();
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div>
      <LargeTitle title="Settings" back />

      <SectionLabel>Appearance</SectionLabel>
      <div className="px-4">
        <Card className="p-4">
          <div className="flex items-center gap-3 pb-3">
            <Moon size={19} className="text-accent" />
            <p className="text-[15px] font-semibold">Theme</p>
          </div>
          <SegmentedControl
            value={themePref}
            onChange={setThemePref}
            options={[
              { value: "dark", label: "Dark" },
              { value: "light", label: "Light" },
              { value: "system", label: "System" }
            ]}
          />
        </Card>
      </div>

      <SectionLabel>Membership</SectionLabel>
      <div className="px-4">
        <Card
          onClick={() => navigate("/premium")}
          className="flex items-center gap-3 p-4"
        >
          <Crown size={19} className="text-accent" />
          <p className="flex-1 text-[15px] font-semibold">
            {premium ? "Chains Pro — active" : "Upgrade to Chains Pro"}
          </p>
          <span className="text-[13px] font-semibold text-accent">
            {premium ? "Manage" : "View"}
          </span>
        </Card>
      </div>

      <SectionLabel>Demo data</SectionLabel>
      <div className="px-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <RefreshCw size={19} className="text-accent" />
            <div className="flex-1">
              <p className="text-[15px] font-semibold">Reset demo data</p>
              <p className="text-[13px] text-sub">
                Restores mock rounds, favorites and the feed
              </p>
            </div>
          </div>
          {!confirmReset ? (
            <button
              onClick={() => setConfirmReset(true)}
              className="press mt-3 w-full rounded-full bg-card2 py-2.5 text-[14px] font-semibold"
            >
              Reset…
            </button>
          ) : (
            <button
              onClick={resetDemoData}
              className="press mt-3 w-full rounded-full bg-dbl/15 py-2.5 text-[14px] font-bold text-dbl"
            >
              Tap again to confirm reset
            </button>
          )}
        </Card>
      </div>

      <SectionLabel>Account</SectionLabel>
      <div className="px-4 pb-8">
        <Card className="p-2">
          <button
            onClick={signOut}
            className="press flex w-full items-center gap-3 rounded-cell p-3 text-left"
          >
            <LogOut size={19} className="text-dbl" />
            <p className="text-[15px] font-semibold text-dbl">Sign out</p>
          </button>
        </Card>
        <p className="px-2 pt-4 text-[12px] leading-relaxed text-sub">
          Chains 1.0 demo build. All data lives in your browser's local storage —
          nothing is sent to a server.
        </p>
      </div>
    </div>
  );
}
