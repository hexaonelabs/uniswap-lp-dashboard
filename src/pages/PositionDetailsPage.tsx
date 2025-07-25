/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  ExternalLink,
  TrendingUp,
  DollarSign,
  Calendar,
  Target,
  Activity,
  BarChart3,
  PieChart,
  Droplets,
  AlertTriangle,
  CheckCircle,
  Copy,
  // Share,
  Calculator,
  // RefreshCw,
  Eye,
  EyeOff,
  Clock,
  TrendingDown,
  Check,
  X,
} from "lucide-react";
import { Position } from "../types";
import { TokenSymbolsGroup } from "../components/TokenSymbolsGroup";
import { usePositions } from "../hooks/usePositions";
import { NETWORKS } from "../services/fetcher";
import ClaimFeesButton from "../components/ClaimFeesButton";

interface ToastNotification {
  id: string;
  message: string;
  type: "success" | "error" | "info";
  duration?: number;
}

export const PositionDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [position, setPosition] = useState<Position | null>(
    location.state?.position || null
  );
  const { positions } = usePositions(
    localStorage.getItem("evmAddress") || undefined
  );
  const [isLoading, setIsLoading] = useState(!position);
  const [showSensitiveData, setShowSensitiveData] = useState(true);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const chain = useMemo(() => {
    const c = NETWORKS.find((network) => network.id === position?.chain?.id);
    return c || null;
  }, [position]);

  // Mock data for demonstration - replace with actual API call
  useEffect(() => {
    if (!position && id) {
      const foundPosition = positions.find((pos) => pos.id === id);
      if (foundPosition) {
        setPosition(foundPosition);
      } else {
        setPosition(null);
      }
      setIsLoading(false);
    }
  }, [id, position, positions]);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 p-6 rounded-2xl shadow-xl">
          <div className="max-w-7xl mx-auto">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Loading...</h2>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!position) {
    return (
      <div className="space-y-8">
        <div className="bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 p-6 rounded-2xl shadow-xl">
          <div className="max-w-7xl mx-auto">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">
                Position Not Found
              </h2>
              <p className="text-gray-200 mb-4">
                The position you're looking for doesn't exist.
              </p>
              <button
                onClick={() => navigate("/dashboard")}
                className="px-6 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = () => {
    if (!position.isOpen) return "from-gray-500 to-gray-600";
    if (position.isInRange) return "from-green-500 to-emerald-600";
    return "from-amber-500 to-orange-600";
  };

  const getStatusIcon = () => {
    if (!position.isOpen) return <AlertTriangle className="w-5 h-5" />;
    if (position.isInRange) return <CheckCircle className="w-5 h-5" />;
    return <AlertTriangle className="w-5 h-5" />;
  };

  const getStatusText = () => {
    if (!position.isOpen) return "Closed";
    if (position.isInRange) return "In Range";
    return "Out of Range";
  };

  const showToast = (
    message: string,
    type: "success" | "error" | "info" = "success",
    duration: number = 3000
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: ToastNotification = { id, message, type, duration };

    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, duration);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast("Copied to clipboard!", "success");
    } catch (err) {
      console.error("Failed to copy: ", err);
      showToast("Failed to copy to clipboard", "error");
    }
  };

  return (
    <div className="space-y-8">
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out ${
              toast.type === "success"
                ? "bg-green-500 text-white"
                : toast.type === "error"
                ? "bg-red-500 text-white"
                : "bg-blue-500 text-white"
            }`}
          >
            <div className="flex-shrink-0">
              {toast.type === "success" && <Check className="w-5 h-5" />}
              {toast.type === "error" && <X className="w-5 h-5" />}
              {toast.type === "info" && <Copy className="w-5 h-5" />}
            </div>

            <p className="text-sm font-medium flex-1">{toast.message}</p>

            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Header - Style identique à EstimateEarningsPage */}
      <div className="bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 p-6 rounded-2xl shadow-xl">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              {/* Left block - Title and info */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate("/dashboard")}
                  className="p-3 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-colors duration-200"
                >
                  <ArrowLeft className="w-8 h-8 text-white" />
                </button>

                <div className="flex items-center gap-6">
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      Position Details
                    </h1>
                    <div className="hidden sm:flex items-center pt-1">
                      <TokenSymbolsGroup
                        tokens={{
                          token0: position.token0,
                          token1: position.token1,
                        }}
                      />
                      <p className="text-gray-200 ml-2">
                        {position.token0.symbol} / {position.token1.symbol} •
                        Fee {(position.feeTier / 10000).toFixed(2)}% •{" "}
                        {position.chain.name} Network
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* mobile only */}
              <div className="flex sm:hidden items-center pt-1">
                <TokenSymbolsGroup
                  tokens={{ token0: position.token0, token1: position.token1 }}
                />
                <p className="text-gray-400 ml-2">
                  {position.token0.symbol} / {position.token1.symbol} • Fee{" "}
                  {(position.feeTier / 10000).toFixed(2)}% •{" "}
                  {position.chain.name} Network
                </p>
              </div>

              {/* Right block */}
              <div className="flex flex-row gap-3 lg:flex-shrink-0">
                {/* Status Badge */}
                <div
                  className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${getStatusColor()} text-white rounded-xl shadow-lg font-medium`}
                >
                  {getStatusIcon()}
                  <span className="hidden sm:inline">{getStatusText()}</span>
                  <span className="sm:hidden">
                    {getStatusText().split(" ")[0]}
                  </span>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3">

                  <ClaimFeesButton positionId={position.id} chainId={position.chain.id} />

                  <button
                    onClick={() => setShowSensitiveData(!showSensitiveData)}
                    className="flex items-center gap-2 p-2 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-colors duration-200"
                  >
                    {showSensitiveData ? (
                      <EyeOff className="w-4 h-4 text-white" />
                    ) : (
                      <Eye className="w-4 h-4 text-white" />
                    )}
                  </button>

                  {/* <button className="flex items-center gap-2 p-2 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-colors duration-200">
                    <Share className="w-4 h-4 text-white" />
                  </button>

                  <button className="flex items-center gap-2 p-2 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-colors duration-200">
                    <RefreshCw className="w-4 h-4 text-white" />
                  </button> */}
                </div>
              </div>
            </div>
          </div>

          {/* Metrics Cards - Style identique */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-8 h-8 text-green-500" />
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">
                    {showSensitiveData
                      ? `$${position.totalValueUSD.toLocaleString()}`
                      : "••••••"}
                  </div>
                  <div className="text-sm text-gray-400">Total Value</div>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-left">
                    <div className="text-lg font-semibold text-purple-300">
                      {showSensitiveData
                        ? `$${position.feesEarnedUSD.toFixed(2)}`
                        : "••••••"}
                    </div>
                    <div className="text-xs text-gray-400 uppercase tracking-wide">
                      Fees Earned
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-purple-300">
                      {showSensitiveData
                        ? `$${position.unClaimedFees.amountUSD.toFixed(2)}`
                        : "••••••"}
                    </div>
                    <div className="text-xs text-gray-400 uppercase tracking-wide">
                      Unclaimed
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 text-purple-500" />
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">
                    {position.apr.toFixed(2)}%
                  </div>
                  <div className="text-sm text-gray-400">APR</div>
                </div>
              </div>
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-left">
                    <div className="text-lg font-semibold text-purple-300">
                      {`${(position.apr / 365).toFixed(2)}%`}
                    </div>
                    <div className="text-xs text-gray-400 uppercase tracking-wide">
                      Daily
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-purple-300">
                      {`${(position.apr / 12).toFixed(2)}%`}
                    </div>
                    <div className="text-xs text-gray-400 uppercase tracking-wide">
                      Monthly
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <Target className="w-8 h-8 text-blue-500" />
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">
                    {position.isInRange ? "In Range" : "Out Range"}
                  </div>
                  <div className="text-sm text-gray-400">Position Status</div>
                </div>
              </div>
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-left">
                    <div className="text-lg font-semibold text-purple-300">
                      {position.priceRange.min.toFixed(4)}
                    </div>
                    <div className="text-xs text-gray-400 uppercase tracking-wide">
                      Min range
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-purple-300">
                      {position.priceRange.max.toFixed(4)}
                    </div>
                    <div className="text-xs text-gray-400 uppercase tracking-wide">
                      Max range
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <Activity className="w-8 h-8 text-pink-500" />
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">
                    {Math.floor(
                      (Date.now() - new Date(position.createdAt).getTime()) /
                        (1000 * 60 * 60 * 24)
                    )}
                    d
                  </div>
                  <div className="text-sm text-gray-400">Days Active</div>
                </div>
              </div>
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-1 gap-4">
                  <div className="text-right">
                    <div className="text-lg font-semibold text-purple-300">
                      {formatDate(position.createdAt)}
                    </div>
                    <div className="text-xs text-gray-400 uppercase tracking-wide">
                      Created At
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Main Content - Structure identique */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column - Actions Panel */}
        <div className="xl:col-span-1 space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
              <Calculator className="w-5 h-5 text-purple-600" />
              <span>Quick Actions</span>
            </h3>

            <div className="space-y-4">
              <button
                onClick={() => {
                  const url = `/estimate?chainId=${
                    position.chain.id
                  }&poolAddress=${position.poolAddress}&minPrice=${
                    position.priceRange.min
                  }&maxPrice=${
                    position.priceRange.max
                  }&liquidityAmount=${position.totalValueUSD.toFixed(2)}`;
                  navigate(url);
                }}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
              >
                <Calculator className="w-5 h-5" />
                <span>Open Calculator</span>
              </button>

              <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm font-medium"
                onClick={() => {
                  window.open(`https://app.uniswap.org/positions/v3/${chain?.keyMapper}/${position.id}`, "_blank");
                }}>
                <ExternalLink className="w-5 h-5" />
                <span>View on Uniswap</span>
              </button>
            </div>
          </div>

          {/* Liquidity Information */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
              <Droplets className="w-5 h-5 text-blue-600" />
              <span>Liquidity Information</span>
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  Initial Deposit Value
                </span>
                <span className="text-sm font-medium">
                  {showSensitiveData
                    ? `$${(
                        Number(position.depositedToken0) *
                          position.token0.priceUSD +
                        Number(position.depositedToken1) *
                          position.token1.priceUSD
                      ).toLocaleString()}`
                    : "••••••"}
                </span>
              </div>

              <div className="flex justify-between items-start">
                <span className="text-sm text-gray-600">Initial Tokens</span>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {showSensitiveData
                      ? Number(position.depositedToken0).toFixed(4)
                      : "••••••"}{" "}
                    {position.token0.symbol}
                  </div>
                  <div className="text-sm font-medium">
                    {showSensitiveData
                      ? Number(position.depositedToken1).toFixed(4)
                      : "••••••"}{" "}
                    {position.token1.symbol}
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Current Value</span>
                  <span className="text-sm font-medium text-green-600">
                    {showSensitiveData
                      ? `$${position.totalValueUSD.toLocaleString()}`
                      : "••••••"}
                  </span>
                </div>

                <div className="flex justify-between items-start mt-2">
                  <span className="text-sm text-gray-600">Current Tokens</span>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {showSensitiveData ? position.tokensOwed0 : "••••••"}{" "}
                      {position.token0.symbol}
                    </div>
                    <div className="text-sm font-medium">
                      {showSensitiveData ? position.tokensOwed1 : "••••••"}{" "}
                      {position.token1.symbol}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">P&L</span>
                  <span
                    className={`text-sm font-bold ${
                      position.totalValueUSD -
                        (Number(position.depositedToken0) *
                          position.token0.priceUSD +
                          Number(position.depositedToken1) *
                            position.token1.priceUSD) >=
                      0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {showSensitiveData
                      ? `${
                          position.totalValueUSD -
                            (Number(position.depositedToken0) *
                              position.token0.priceUSD +
                              Number(position.depositedToken1) *
                                position.token1.priceUSD) >=
                          0
                            ? "+"
                            : ""
                        }$${(
                          position.totalValueUSD -
                          (Number(position.depositedToken0) *
                            position.token0.priceUSD +
                            Number(position.depositedToken1) *
                              position.token1.priceUSD)
                        ).toFixed(2)}`
                      : "••••••"}
                  </span>
                </div>

                <div className="flex justify-between items-center mt-1">
                  <span className="text-sm text-gray-600">P&L %</span>
                  <span
                    className={`text-sm font-bold ${
                      position.totalValueUSD -
                        (Number(position.depositedToken0) *
                          position.token0.priceUSD +
                          Number(position.depositedToken1) *
                            position.token1.priceUSD) >=
                      0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {showSensitiveData
                      ? `${
                          position.totalValueUSD -
                            (Number(position.depositedToken0) *
                              position.token0.priceUSD +
                              Number(position.depositedToken1) *
                                position.token1.priceUSD) >=
                          0
                            ? "+"
                            : ""
                        }${(
                          ((position.totalValueUSD -
                            (Number(position.depositedToken0) *
                              position.token0.priceUSD +
                              Number(position.depositedToken1) *
                                position.token1.priceUSD)) /
                            (Number(position.depositedToken0) *
                              position.token0.priceUSD +
                              Number(position.depositedToken1) *
                                position.token1.priceUSD)) *
                          100
                        ).toFixed(2)}%`
                      : "••••••"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Position Information */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
              <Activity className="w-5 h-5 text-gray-600" />
              <span>Position Information</span>
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Position ID</span>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-sm">{position.id}</span>
                  <button
                    onClick={() => copyToClipboard(position.id)}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pool Address</span>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-sm">
                    {position.poolAddress.slice(0, 6)}...
                    {position.poolAddress.slice(-4)}
                  </span>
                  <button
                    onClick={() => copyToClipboard(position.poolAddress)}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Initial Deposit</span>
                <span className="text-sm font-medium text-right">
                  {Number(position.depositedToken0).toFixed(4)}{" "}
                  {position.token0.symbol}
                  <br />
                  {Number(position.depositedToken1).toFixed(4)}{" "}
                  {position.token1.symbol}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Created</span>
                <span className="text-sm font-medium">
                  {formatDate(position.createdAt)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Content Panel */}
        <div className="xl:col-span-2 space-y-8">
          {/* Overview Section */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
              <Eye className="w-6 h-6 text-purple-600" />
              <span>Overview</span>
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Price Range Visualization */}
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                  <Target className="w-5 h-5 text-purple-600" />
                  <span>Price Range</span>
                </h3>

                <div className="relative mb-6">
                  <div className="w-full bg-gradient-to-r from-purple-200 to-blue-200 rounded-full h-3 relative">
                    <div
                      className="h-3 rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
                      style={{ width: `${position.token0BalancePercentage}%` }}
                    />

                    <div
                      className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-6 h-6 bg-gradient-to-r from-green-400 to-green-600 border-3 border-white rounded-full shadow-lg"
                      style={{ left: `${position.token0BalancePercentage}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center mt-4">
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-1">Min Price</p>
                      <p className="text-sm font-semibold text-purple-600">
                        {position.priceRange.min}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-1">Current</p>
                      <p className="text-sm font-semibold text-green-600">
                        {position.currentPrice.toFixed(4)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-1">Max Price</p>
                      <p className="text-sm font-semibold text-blue-600">
                        {position.priceRange.max}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Liquidity Composition */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                  <PieChart className="w-5 h-5 text-blue-600" />
                  <span>Liquidity Composition</span>
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full"></div>
                      <span className="font-medium">
                        {position.token0.symbol}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {showSensitiveData ? position.tokensOwed0 : "••••••"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {Number(position.token0BalancePercentage).toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></div>
                      <span className="font-medium">
                        {position.token1.symbol}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {showSensitiveData ? position.tokensOwed1 : "••••••"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {(
                          100 - Number(position.token0BalancePercentage)
                        ).toFixed(1)}
                        %
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Analytics Section */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              <span>Analytics</span>
            </h2>

            {/* Fee Analytics */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                <Droplets className="w-5 h-5 text-green-600" />
                <span>Fee Analytics</span>
              </h3>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-white rounded-lg border border-green-200">
                  <p className="text-sm text-gray-600 mb-1">Total Earned</p>
                  <p className="text-xl font-bold text-green-600">
                    {showSensitiveData
                      ? `$${position.feesEarnedUSD.toFixed(2)}`
                      : "••••••"}
                  </p>
                </div>

                <div className="text-center p-4 bg-white rounded-lg border border-green-200">
                  <p className="text-sm text-gray-600 mb-1">Unclaimed</p>
                  <p className="text-xl font-bold text-amber-600">
                    {showSensitiveData
                      ? `$${position.unClaimedFees.amountUSD.toFixed(2)}`
                      : "••••••"}
                  </p>
                </div>

                <div className="text-center p-4 bg-white rounded-lg border border-green-200">
                  <p className="text-sm text-gray-600 mb-1">Daily Est.</p>
                  <p className="text-xl font-bold text-blue-600">
                    {showSensitiveData
                      ? `$${(
                          (position.feesEarnedUSD * position.apr) /
                          365
                        ).toFixed(2)}`
                      : "••••••"}
                  </p>
                </div>

                <div className="text-center p-4 bg-white rounded-lg border border-green-200">
                  <p className="text-sm text-gray-600 mb-1">APR</p>
                  <p className="text-xl font-bold text-purple-600">
                    {position.apr.toFixed(2)}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* History Section */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
              <Calendar className="w-6 h-6 text-indigo-600" />
              <span>Transaction History</span>
            </h2>

            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                Fee collection history and position updates coming soon.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium">
                      Last Fee Collection
                    </span>
                  </div>
                  <p className="text-lg font-bold text-gray-800">
                    {formatDate(position.lastUpdated)}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Activity className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium">
                      Total Transactions
                    </span>
                  </div>
                  <p className="text-lg font-bold text-gray-800">Coming Soon</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingDown className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium">
                      Avg. Fee per Day
                    </span>
                  </div>
                  <p className="text-lg font-bold text-gray-800">
                    {showSensitiveData
                      ? `$${(
                          (position.feesEarnedUSD * position.apr) /
                          365
                        ).toFixed(2)}`
                      : "••••••"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
