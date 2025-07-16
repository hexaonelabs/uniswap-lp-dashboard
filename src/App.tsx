import {
  Routes,
  Route,
  Navigate,
  useSearchParams
} from "react-router";
import { PoolSearchPage } from "./pages/PoolSearch";
import Footer from "./components/Footer";
import { PositionsDashboardPage } from "./pages/PositionsDashboardPage";
import { useEffect } from "react";
import { NavMenu } from "./components/NavMenu";
import { useLocation } from "react-router";
import { EstimateEarningsPage } from "./pages/EstimateEarningsPage";
// import { Chart } from "./components/Chart";

export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Remonter en haut de la page à chaque changement de route
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth" // Animation fluide
    });
  }, [pathname]);

  return null;
}

function App() {
  const [searchParams] = useSearchParams();
  const { pathname } = useLocation();
  const addressToValidate = searchParams.get("address");
  const storedAddress = localStorage.getItem("evmAddress");
  // overide storage with search param if it exists
  const evmAddress = addressToValidate || storedAddress || undefined;
  useEffect(() => {
    if (evmAddress ) {
      localStorage.setItem("evmAddress", evmAddress);
    }
  }, [evmAddress, pathname]);

  const linkToDashboard = `/dashboard${
    evmAddress ? `?address=${evmAddress}` : ""
  }`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
      <ScrollToTop />
      <div className="flex-1 max-w-7xl mx-auto px-4 py-4 sm:px-8 sm:py-8 w-full">
        {/* Navigation Tabs */}

        <div className="flex justify-center mb-8">
          <NavMenu linkToDashboard={linkToDashboard} />
        </div>

        <div className="flex-1 max-w-7xl mx-auto px-0 pt-12 sm:pt-12 pb-4 sm:pb-8 w-full">
          <Routes>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<PositionsDashboardPage />} />
            <Route path="explore" element={<PoolSearchPage />} />
            <Route path="estimate" element={<EstimateEarningsPage />} />
            {/* <Route path="/analytics" element={<Chart data={mockChartData} />} /> */}
            <Route
              path="*"
              element={
                <div className="text-center text-gray-500">Page not found</div>
              }
            />
          </Routes>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default App;
