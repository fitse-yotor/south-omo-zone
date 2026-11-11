import React from "react";
import { createRoot } from "react-dom/client";
import { HashRouter, Routes, Route } from "react-router-dom";
import { LangProvider } from "./i18n";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Woredas from "./pages/Woredas";
import WoredaDetail from "./pages/WoredaDetail";
import Opportunities from "./pages/Opportunities";
import Announcements from "./pages/Announcements";
import Contact from "./pages/Contact";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <LangProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="woredas" element={<Woredas />} />
            <Route path="woredas/:id" element={<WoredaDetail />} />
            <Route path="opportunities" element={<Opportunities />} />
            <Route path="announcements" element={<Announcements />} />
            <Route path="contact" element={<Contact />} />
            <Route path="*" element={<p className="wrap pad">404</p>} />
          </Route>
        </Routes>
      </HashRouter>
    </LangProvider>
  </React.StrictMode>
);
