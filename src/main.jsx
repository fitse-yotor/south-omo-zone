import React from "react";
import { createRoot } from "react-dom/client";
import { HashRouter, Route, Routes } from "react-router-dom";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/playfair-display/400.css";
import "@fontsource/playfair-display/400-italic.css";
import "@fontsource/playfair-display/500.css";
import "@fontsource/noto-sans-ethiopic/400.css";
import "@fontsource/noto-sans-ethiopic/600.css";
import "@fontsource/noto-serif-ethiopic/400.css";
import "@fontsource/noto-serif-ethiopic/600.css";
import "./index.css";
import { LangProvider } from "./i18n";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import About from "./pages/About";
import Invest from "./pages/Invest";
import Woredas from "./pages/Woredas";
import WoredaDetail from "./pages/WoredaDetail";
import Tourism from "./pages/Tourism";
import Announcements from "./pages/Announcements";
import Contact from "./pages/Contact";
import Credits from "./pages/Credits";
import News from "./pages/News";
import { initStore } from "./cms/store";
import { RequireAuth } from "./cms/auth";
import Login from "./admin/Login";
import AdminLayout from "./admin/AdminLayout";
import Dashboard from "./admin/Dashboard";
import NewsAdmin from "./admin/NewsAdmin";
import AnnouncementsAdmin from "./admin/AnnouncementsAdmin";
import TourismAdmin from "./admin/TourismAdmin";
import InvestmentAdmin from "./admin/InvestmentAdmin";
import SiteAdmin from "./admin/SiteAdmin";
import DataAdmin from "./admin/DataAdmin";

// Apply content edits saved from the admin panel before anything renders
initStore();
import { PageHero } from "./components/ui";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <LangProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="invest" element={<Invest />} />
            <Route path="woredas" element={<Woredas />} />
            <Route path="woredas/:id" element={<WoredaDetail />} />
            <Route path="tourism" element={<Tourism />} />
            <Route path="news" element={<News />} />
            <Route path="announcements" element={<Announcements />} />
            <Route path="contact" element={<Contact />} />
            <Route path="credits" element={<Credits />} />
            <Route path="*" element={<PageHero eyebrow="404" title="Page not found" />} />
          </Route>
          <Route path="login" element={<Login />} />
          <Route path="admin" element={<RequireAuth><AdminLayout /></RequireAuth>}>
            <Route index element={<Dashboard />} />
            <Route path="news" element={<NewsAdmin />} />
            <Route path="announcements" element={<AnnouncementsAdmin />} />
            <Route path="tourism" element={<TourismAdmin />} />
            <Route path="investment" element={<InvestmentAdmin />} />
            <Route path="site" element={<SiteAdmin />} />
            <Route path="data" element={<DataAdmin />} />
          </Route>
        </Routes>
      </HashRouter>
    </LangProvider>
  </React.StrictMode>
);
