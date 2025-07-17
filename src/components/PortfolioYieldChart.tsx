/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import {
  TrendingUp,
  PieChart as PieChartIcon,
  BarChart3,
  Target,
  Calendar,
  DollarSign,
} from "lucide-react";

export interface YieldChartData {
  totalDailyEarnings: number;
  totalMonthlyEarnings: number;
  totalYearlyEarnings: number;
  averageAPR: number;
  positions: Array<{
    id: string;
    symbol: string;
    apr: number;
    dailyEarnings: number;
    liquidityAmount: number;
    allocation: number;
    chainName: string;
    feeTier: number;
  }>;
  hideTimeline?: boolean;
}

interface PortfolioYieldChartProps {
  data: YieldChartData;
}

export const PortfolioYieldChart: React.FC<PortfolioYieldChartProps> = ({
  data,
}) => {
  const [activeView, setActiveView] = useState<
    "allocation" | "performance" | "timeline"
  >("allocation");

  // Couleurs du thème emerald/teal/cyan
  const colors = [
    "#10b981", // emerald-500
    "#14b8a6", // teal-500
    "#06b6d4", // cyan-500
    "#8b5cf6", // violet-500
    "#f59e0b", // amber-500
    "#ef4444", // red-500
    "#84cc16", // lime-500
    "#ec4899", // pink-500
  ];

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    return `$${value.toFixed(2)}`;
  };

  // Configuration pour le graphique en secteurs (allocation)
  const pieChartOptions: ApexOptions = useMemo(
    () => ({
      chart: {
        type: "donut",
        height: 350,
        toolbar: { show: false },
        background: "transparent",
      },
      colors: colors,
      labels: data.positions.map((p) => p.symbol),
      legend: {
        show: false,
      },
      dataLabels: {
        enabled: true,
        formatter: (val: number) => `${val.toFixed(1)}%`,
        style: {
          fontSize: "12px",
          fontWeight: 600,
          colors: ["#ffffff"],
        },
        dropShadow: {
          enabled: true,
          top: 1,
          left: 1,
          blur: 1,
          color: "#000",
          opacity: 0.45,
        },
      },
      plotOptions: {
        pie: {
          donut: {
            size: "60%",
            labels: {
              show: true,
              name: {
                show: true,
                fontSize: "16px",
                fontWeight: 600,
                color: "#374151",
              },
              value: {
                show: true,
                fontSize: "24px",
                fontWeight: 700,
                color: "#10b981",
                formatter: (val: string) => `${parseFloat(val).toFixed(1)}%`,
              },
              total: {
                show: true,
                label: "Portfolio",
                fontSize: "14px",
                fontWeight: 600,
                color: "#6b7280",
                formatter: () => `${data.positions.length} Positions`,
              },
            },
          },
        },
      },
      tooltip: {
        custom: ({ series, seriesIndex }) => {
          const position = data.positions[seriesIndex];
          return `
          <div class="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
            <div class="font-semibold text-gray-800 mb-2">${
              position.symbol
            }</div>
            <div class="space-y-1 text-sm">
              <div class="flex justify-between gap-4">
                <span class="text-gray-600">Allocation:</span>
                <span class="font-semibold">${series[seriesIndex].toFixed(
                  1
                )}%</span>
              </div>
              <div class="flex justify-between gap-4">
                <span class="text-gray-600">Amount:</span>
                <span class="font-semibold">${formatCurrency(
                  position.liquidityAmount
                )}</span>
              </div>
              <div class="flex justify-between gap-4">
                <span class="text-gray-600">APR:</span>
                <span class="font-semibold text-emerald-600">${position.apr.toFixed(
                  2
                )}%</span>
              </div>
              <div class="flex justify-between gap-4">
                <span class="text-gray-600">Chain:</span>
                <span class="font-semibold">${position.chainName}</span>
              </div>
            </div>
          </div>
        `;
        },
      },
      responsive: [
        {
          breakpoint: 768,
          options: {
            chart: { height: 280 },
            dataLabels: { enabled: false },
          },
        },
      ],
    }),
    [data.positions, colors]
  );

  // Configuration pour le graphique de performance (barres)
  const barChartOptions: ApexOptions = useMemo(
    () => ({
      chart: {
        type: "bar",
        height: 400,
        toolbar: { show: false },
        background: "transparent",
      },
      colors: ["#10b981", "#14b8a6"],
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "60%",
          endingShape: "rounded",
          borderRadius: 8,
          dataLabels: { position: "top" },
        },
      },
      dataLabels: {
        enabled: true,
        formatter: (val: number, opts: any) => {
          const seriesName =
            opts?.w?.config?.series?.[opts?.seriesIndex]?.name || "";
          return seriesName.includes("APR")
            ? `${val.toFixed(1)}%`
            : `${val.toFixed(1)}%`;
        },
        offsetY: -20,
        style: {
          fontSize: "10px",
          colors: ["#374151"],
        },
      },
      stroke: { show: true, width: 2, colors: ["transparent"] },
      xaxis: {
        categories: data.positions.map((p) => p.symbol),
        labels: {
          style: { colors: "#6b7280", fontSize: "12px" },
        },
      },
      yaxis: [
        {
          title: {
            text: "APR (%)",
            style: { color: "#10b981", fontSize: "12px" },
          },
          labels: {
            style: { colors: "#6b7280" },
            formatter: (val: number) => `${val.toFixed(0)}%`,
          },
        },
        {
          opposite: true,
          title: {
            text: "Allocation (%)",
            style: { color: "#14b8a6", fontSize: "12px" },
          },
          labels: {
            style: { colors: "#6b7280" },
            formatter: (val: number) => `${val.toFixed(0)}%`,
          },
        },
      ],
      fill: { opacity: 1 },
      tooltip: {
        shared: true,
        intersect: false,
        y: {
          formatter: (val: number, opts: any) => {
            const seriesName = opts?.series?.[opts?.seriesIndex]?.name || "";
            return seriesName?.includes("APR")
              ? `${val.toFixed(2)}%`
              : `${val.toFixed(1)}%`;
          },
        },
      },
      legend: {
        position: "top",
        horizontalAlign: "right",
        fontSize: "12px",
        markers: {
          size: 6,
          strokeWidth: 0,
          fillColors: ["#10b981", "#14b8a6"],
        },
      },
      grid: {
        borderColor: "#f1f5f9",
        strokeDashArray: 3,
      },
    }),
    [data.positions]
  );

  // Données pour la timeline (30 derniers jours)
  const timelineData = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));

      const baseEarnings = data.totalDailyEarnings;
      const variation = (Math.random() - 0.5) * 0.3;
      const dailyEarnings = baseEarnings * (1 + variation);
      return {
        x: date.getTime(),
        y: Number(dailyEarnings.toFixed(2)),
      };
    });
  }, [data.totalDailyEarnings]);

  // Configuration pour le graphique timeline (area)
  const areaChartOptions: ApexOptions = useMemo(
    () => ({
      chart: {
        type: "area",
        height: 400,
        toolbar: { show: false },
        background: "transparent",
        zoom: { enabled: false },
      },
      colors: ["#10b981"],
      dataLabels: { enabled: false },
      stroke: {
        curve: "smooth",
        width: 3,
      },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.4,
          opacityTo: 0.1,
          stops: [0, 90, 100],
          colorStops: [
            {
              offset: 0,
              color: "#10b981",
              opacity: 0.4,
            },
            {
              offset: 100,
              color: "#10b981",
              opacity: 0.1,
            },
          ],
        },
      },
      xaxis: {
        type: "datetime",
        labels: {
          style: { colors: "#6b7280", fontSize: "12px" },
          datetimeFormatter: {
            year: "yyyy",
            month: "MMM",
            day: "dd MMM",
            hour: "HH:mm",
          },
        },
      },
      yaxis: {
        title: {
          text: "Daily Earnings ($)",
          style: { color: "#10b981", fontSize: "12px" },
        },
        labels: {
          style: { colors: "#6b7280" },
          formatter: (val: number) => formatCurrency(val),
        },
      },
      tooltip: {
        x: {
          format: "dd MMM yyyy",
        },
        y: {
          formatter: (val: number) => formatCurrency(val),
        },
      },
      grid: {
        borderColor: "#f1f5f9",
        strokeDashArray: 3,
      },
      markers: {
        size: 0,
        hover: { size: 6 },
      },
    }),
    []
  );

  const ViewButton = ({
    view,
    icon: Icon,
    label,
    isActive,
  }: {
    view: string;
    icon: any;
    label: string;
    isActive: boolean;
  }) => (
  <button
    onClick={() => setActiveView(view as any)}
    className={`flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-lg transition-all duration-200 text-xs sm:text-sm font-medium min-w-0 flex-1 sm:flex-initial ${
      isActive
        ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg"
        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
    }`}
  >
    <Icon className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
    <span className="truncate sm:whitespace-nowrap">{label}</span>
  </button>
  );

  return (
    <div className="space-y-6">
      {/* Header avec boutons de vue */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Portfolio Analytics
          </h3>
          <p className="text-gray-600 text-sm">
            Visualize your portfolio performance and allocation
          </p>
        </div>

        <div className="flex gap-1 sm:gap-2 w-full sm:w-auto sm:justify-end">
          <ViewButton
            view="allocation"
            icon={PieChartIcon}
            label="Allocation"
            isActive={activeView === "allocation"}
          />
          <ViewButton
            view="performance"
            icon={BarChart3}
            label="Performance"
            isActive={activeView === "performance"}
          />
          {!data.hideTimeline && (
            <ViewButton
              view="timeline"
              icon={TrendingUp}
              label="Timeline"
              isActive={activeView === "timeline"}
            />
          )}
        </div>
      </div>

      {/* Métriques rapides */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-xl border border-emerald-200">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-medium text-emerald-700">
              Daily Yield
            </span>
          </div>
          <div className="text-lg font-bold text-emerald-800">
            {formatCurrency(data.totalDailyEarnings)}
          </div>
        </div>

        <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-4 rounded-xl border border-teal-200">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-4 h-4 text-teal-600" />
            <span className="text-xs font-medium text-teal-700">
              Monthly Proj.
            </span>
          </div>
          <div className="text-lg font-bold text-teal-800">
            {formatCurrency(data.totalMonthlyEarnings)}
          </div>
        </div>

        <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-4 rounded-xl border border-cyan-200">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-cyan-600" />
            <span className="text-xs font-medium text-cyan-700">Avg APR</span>
          </div>
          <div className="text-lg font-bold text-cyan-800">
            {data.averageAPR.toFixed(2)}%
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-4 h-4 text-purple-600" />
            <span className="text-xs font-medium text-purple-700">
              Positions
            </span>
          </div>
          <div className="text-lg font-bold text-purple-800">
            {data.positions.length}
          </div>
        </div>
      </div>

      {/* Graphiques */}
      <motion.div
        key={activeView}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-xl p-6 border border-gray-200"
      >
        {activeView === "allocation" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Pie Chart */}
            <div>
              <h5 className="text-lg font-semibold text-gray-800 mb-4">
                Portfolio Allocation
              </h5>
              <Chart
                options={pieChartOptions}
                series={data.positions.map((p) => p.allocation)}
                type="donut"
                height={350}
              />
            </div>

            {/* Allocation List */}
            <div>
              <h5 className="text-lg font-semibold text-gray-800 mb-4">
                Position Details
              </h5>
              <div className="space-y-3">
                {data.positions.sort((a, b) => b.allocation - a.allocation).map((position, index) => (
                  <div
                    key={position.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{
                          backgroundColor: colors[index % colors.length],
                        }}
                      />
                      <div>
                        <div className="font-medium text-gray-800">
                          {position.symbol}
                        </div>
                        <div className="text-xs text-gray-500">
                          {position.chainName} •{" "}
                          {(position.feeTier / 10000).toFixed(2)}%
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-800">
                        {position.allocation.toFixed(1)}%
                      </div>
                      <div className="text-xs text-emerald-600">
                        {position.apr.toFixed(2)}% APR
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeView === "performance" && (
          <div>
            <h5 className="text-lg font-semibold text-gray-800 mb-4">
              APR vs Allocation
            </h5>
            <Chart
              options={barChartOptions}
              series={[
                {
                  name: "APR (%)",
                  data: data.positions.map((p) => p.apr),
                },
                {
                  name: "Allocation (%)",
                  data: data.positions.map((p) => p.allocation),
                },
              ]}
              type="bar"
              height={400}
            />
          </div>
        )}

        {activeView === "timeline" && (
          <div>
            <h5 className="text-lg font-semibold text-gray-800 mb-4">
              Earnings Timeline (30 Days)
            </h5>
            <Chart
              options={areaChartOptions}
              series={[
                {
                  name: "Daily Earnings",
                  data: timelineData,
                },
              ]}
              type="area"
              height={400}
            />
          </div>
        )}
      </motion.div>
    </div>
  );
};
