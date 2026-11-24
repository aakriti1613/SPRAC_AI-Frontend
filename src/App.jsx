import { BrowserRouter, Route, Routes } from "react-router-dom";

import PortalWizard from "./portal/PortalWizard";
import Builder from "./builder/Builder";
import PortalApp from "./portal-runtime/PortalApp";
import Home from "./home/Home";
import ChooseMode from "./home/ChooseMode";
import TemplateGallery from "./home/TemplateGallery";
import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";
import LoginPage from "./auth/LoginPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/new/:type" element={<ProtectedRoute><ChooseMode /></ProtectedRoute>} />
          <Route path="/new/:type/templates" element={<ProtectedRoute><TemplateGallery /></ProtectedRoute>} />
          <Route path="/builder" element={<ProtectedRoute><Builder /></ProtectedRoute>} />
          <Route path="/portal/new/:templateId" element={<ProtectedRoute><PortalWizard /></ProtectedRoute>} />
          <Route path="/portal/:slug/*" element={<ProtectedRoute><PortalApp /></ProtectedRoute>} />
          <Route path="/p/:slug/*" element={<ProtectedRoute><PortalApp /></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
