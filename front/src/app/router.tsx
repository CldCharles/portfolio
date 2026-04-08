import { BrowserRouter, Route, Routes } from "react-router-dom";
import { SiteLayout } from "../components/layout/SiteLayout";
import { CvStudioPage } from "../pages/CvStudioPage";
import { HomePage } from "../pages/HomePage";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<SiteLayout />}>
          <Route index element={<HomePage />} />
          <Route path="/cv-studio" element={<CvStudioPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
