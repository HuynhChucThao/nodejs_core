import React, { useState } from "react";
import { AuthModal } from "./components/auth/AuthModal";
import { AppHeader } from "./components/layout/AppHeader";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AdminDashboard } from "./pages/AdminDashboard";
import { AiAssistantPage } from "./pages/AiAssistantPage";
import { ExplorePage } from "./pages/ExplorePage";
import { HistoryPage } from "./pages/HistoryPage";
import { HomePage } from "./pages/HomePage";
import { OccupationDetailPage } from "./pages/OccupationDetailPage";
import { PreTestPage } from "./pages/PreTestPage";
import { ProfilePage } from "./pages/ProfilePage";
import { ResultPage } from "./pages/ResultPage";
import { TestPage } from "./pages/TestPage";
import { Occupation, TestResult } from "./types";

export const MainApp: React.FC = () => {
  const { user, logout } = useAuth();

  // Tabs: 'home' | 'explore' | 'ai' | 'history' | 'profile' | 'pre-test' | 'test' | 'result' | 'occupation-detail'
  const [activeTab, setActiveTab] = useState<string>("home");

  // Dynamic Page Context State
  const [selectedOccupation, setSelectedOccupation] =
    useState<Occupation | null>(null);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [aiContext, setAiContext] = useState<
    { jobName?: string; riasecCode?: string } | undefined
  >(undefined);
  const [exploreCategory, setExploreCategory] = useState<string | undefined>(
    undefined,
  );

  if (user?.role === "ADMIN") {
    return (
      <div className="app-container">
        <AdminDashboard onLogout={logout} />
        <AuthModal />
      </div>
    );
  }
  // Navigation handlers
  const handleNavigate = (page: string, params?: Record<string, unknown>) => {
    if (page === "explore" && params?.mainCode) {
      setExploreCategory(params.mainCode as string);
    }
    setActiveTab(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectOccupation = (occ: Occupation) => {
    setSelectedOccupation(occ);
    setActiveTab("occupation-detail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStartTest = () => {
    setActiveTab("test");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFinishTest = (result: TestResult) => {
    setTestResult(result);
    setActiveTab("result");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAskAiFromDetail = (jobName: string, riasecCode: string) => {
    setAiContext({ jobName, riasecCode });
    setActiveTab("ai");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAskAiFromResult = (code: string) => {
    setAiContext({ riasecCode: code });
    setActiveTab("ai");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="app-container">
      {/* Top Desktop Window Navigation Header */}
      <AppHeader activeTab={activeTab} onSelectTab={handleNavigate} />

      {/* Main Full-Width Content Container */}
      <main className="window-content-wrapper">
        {activeTab === "home" && (
          <HomePage
            onNavigate={handleNavigate}
            onSelectOccupation={handleSelectOccupation}
          />
        )}

        {activeTab === "explore" && (
          <ExplorePage
            initialCategory={exploreCategory}
            onSelectOccupation={handleSelectOccupation}
          />
        )}

        {activeTab === "occupation-detail" && selectedOccupation && (
          <OccupationDetailPage
            occupation={selectedOccupation}
            onBack={() => setActiveTab("explore")}
            onAskAi={handleAskAiFromDetail}
          />
        )}

        {activeTab === "pre-test" && (
          <PreTestPage
            onStartTest={handleStartTest}
            onBack={() => setActiveTab("home")}
          />
        )}

        {activeTab === "test" && (
          <TestPage
            onBack={() => setActiveTab("home")}
            onFinishTest={handleFinishTest}
          />
        )}

        {activeTab === "result" && testResult && (
          <ResultPage
            result={testResult}
            onRetest={() => setActiveTab("test")}
            onSelectOccupation={handleSelectOccupation}
            onAskAiWithResult={handleAskAiFromResult}
          />
        )}

        {activeTab === "ai" && <AiAssistantPage initialContext={aiContext} />}

        {activeTab === "history" && (
          <HistoryPage
            onSelectResult={(result) => {
              setTestResult(result);
              setActiveTab("result");
            }}
            onStartTest={() => setActiveTab("pre-test")}
          />
        )}

        {activeTab === "profile" && (
          <ProfilePage onSelectOccupation={handleSelectOccupation} />
        )}
      </main>

      {/* Global Auth Modal */}
      <AuthModal />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
