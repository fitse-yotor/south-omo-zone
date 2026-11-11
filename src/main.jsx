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
            <Route path="announcements" element={<Announcements />} />
            <Route path="contact" element={<Contact />} />
            <Route path="credits" element={<Credits />} />
            <Route path="*" element={<PageHero eyebrow="404" title="Page not found" />} />
          </Route>
        </Routes>
      </HashRouter>
    </LangProvider>
  </React.StrictMode>
);
