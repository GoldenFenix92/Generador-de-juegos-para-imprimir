import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Home from "./pages/Home";
import Generator from "./pages/Generator";

const PrintPreview = lazy(() => import("./pages/PrintPreview"));
const PlayOnline = lazy(() => import("./pages/PlayOnline"));

function App() {
  return (
    <Layout>
      <Suspense fallback={<div className="p-8 text-center text-gray-500">Cargando...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/generator/:game" element={<Generator />} />
          <Route path="/print/:game" element={<PrintPreview />} />
          <Route path="/play/:game" element={<PlayOnline />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}

export default App;
