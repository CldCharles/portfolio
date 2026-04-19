import { BrowserRouter, Route, Routes } from "react-router-dom";
import { SiteLayout } from "../components/layout/SiteLayout";
import { CvStudioPage } from "../pages/CvStudioPage";
import { HomePage } from "../pages/HomePage";
import { PlannerPage } from "../pages/PlannerPage";
import { RoadmapPage } from "../pages/RoadmapPage";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<SiteLayout />}>
          <Route index element={<HomePage />} />
          <Route path="/cv-studio" element={<CvStudioPage />} />
          <Route path="/roadmap" element={<RoadmapPage />} />
          <Route path="/planner" element={<PlannerPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
