import React, { useEffect, useState } from "react";
import {
  Search,
  ExternalLink,
  Star,
  BarChart3,
  Calculator,
} from "lucide-react";
import { usePools } from "../hooks/usePools";
import { useNavigate } from "react-router-dom";

// const CandleStickChart = ({ data }: { data: PoolColumnDataType }) => {
//   const [isLoading, setIsLoading] = useState(true);
//   const [isPriceToggle, setIsPriceToggle] = useState(false);

//   useEffect(() => {
//     setTimeout(() => {
//       setIsLoading(false);
//     }, 200);
//   }, []);

//   return (
//     <div style={{ color: "black" }}>
//       <div
//         style={{
//           color: "white",
//           fontWeight: 500,
//           display: "flex",
//           justifyContent: "space-between",
//         }}
//       >
//         <span>
//           {isPriceToggle ? data.token1.symbol : data.token0.symbol}/
//           {isPriceToggle ? data.token0.symbol : data.token1.symbol} Price Chart
//           (14D)
//         </span>
//         <div
//           style={{
//             borderRadius: 7,
//             background: "rgba(255, 255, 255, 0.25)",
//             cursor: "pointer",
//             fontSize: "0.875rem",
//             width: 22,
//             height: 22,
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//           }}
//           onClick={() => setIsPriceToggle(!isPriceToggle)}
//         >
//           {/* <FontAwesomeIcon icon={faExchangeAlt} /> */} exchange
//         </div>
//       </div>

//       {isLoading && <div style={{ height: 205, width: 300 }} />}
//       {!isLoading && (
//         <Chart
//           key={`candlestick-chart-${data.poolId}`}
//           options={{
//             tooltip: {
//               custom: function ({ seriesIndex, dataPointIndex, w }) {
//                 // eslint-disable-next-line @typescript-eslint/no-explicit-any
//                 const data: any =
//                   w.globals.initialSeries[seriesIndex].data[dataPointIndex];

//                 return `<div style="padding: 5px">
//                 <div style="margin-bottom: 5px">${new Date(
//                   data.x
//                 ).toDateString()}</div>

//                 <div><b>Open:</b> ${round(data.y[0], 6)}</div>
//                 <div><b>High:</b> ${round(data.y[1], 6)}</div>
//                 <div><b>Low:</b> ${round(data.y[2], 6)}</div>
//                 <div><b>Close:</b> ${round(data.y[3], 6)}</div>
//               </div>`;
//               },
//             },
//             chart: {
//               toolbar: {
//                 show: false,
//               },
//               foreColor: "#999",
//             },
//             xaxis: {
//               type: "datetime",
//               tooltip: {
//                 enabled: false,
//               },
//             },
//             yaxis: {
//               show: false,
//               tooltip: {
//                 enabled: true,
//               },
//             },
//           }}
//           series={[
//             {
//               data: data.poolDayDatas.map((d: PoolDayData) => {
//                 let open = Number(d.open);
//                 let close = Number(d.close);
//                 let high = Number(d.high);
//                 let low = Number(d.low);

//                 if (isPriceToggle) {
//                   open = 1 / Number(d.open);
//                   close = 1 / Number(d.close);
//                   high = 1 / Number(d.low);
//                   low = 1 / Number(d.high);
//                 }

//                 return {
//                   x: new Date(d.date * 1000),
//                   y: [open, high, low, close],
//                 };
//               }),
//             },
//           ]}
//           type="candlestick"
//           height={190}
//         />
//       )}
//     </div>
//   );
// };

export const PoolSearch: React.FC = () => {
  const { pools, loading: loading } = usePools();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"apr" | "tvl" | "volume">("apr");
  const [selectedChain, setSelectedChain] = useState("all");
  const [maxPools, setMaxPools] = useState(10);
  const navigate = useNavigate();

  const filteredPools = pools
    .filter((pool) => {
      const matchesSearch =
        pool.token0.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pool.token1.symbol.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesChain =
        selectedChain === "all" || pool.chain.id.toString() === selectedChain;

      return matchesSearch && matchesChain;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "apr":
          return b.apy - a.apy;
        case "tvl":
          return b.totalValueLockedUSD - a.totalValueLockedUSD;
        case "volume":
          return b.volume24h - a.volume24h;
        default:
          return 0;
      }
    })
    .slice(0, maxPools); // Limit to top 20 pools

  const formatLargeNumber = (num: number) => {
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(1)}K`;
    return `$${num.toLocaleString()}`;
  };

  // listen scroll to bottom to load more pools
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 250
      ) {
        setMaxPools((prev) => prev + 20); // Load 20 more pools
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      <div className="bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 text-white rounded-2xl shadow-lg p-6 border border-gray-100 mb-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-green-100 rounded-xl backdrop-blur-sm">
            <Search className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <h3 className="text-3xl font-bold">Pool Rewards Explorer</h3>
            <p className="text-white/90">
              Find the highest yielding pools across networks
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search pools (e.g., USDC, ETH)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              />
            </div>
          </div>

          <select
            value={selectedChain}
            onChange={(e) => setSelectedChain(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
          >
            <option value="all">All Chains</option>
            <option value="42161">Arbitrum</option>
            <option value="8453">Base</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value as "apr" | "tvl" | "volume")
            }
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
          >
            <option value="apr">Highest APR</option>
            <option value="tvl">Highest TVL</option>
            <option value="volume">Highest Volume</option>
          </select>
        </div>

        <div className="flex items-center space-x-6 text-white/80">
          <div className="flex items-center space-x-2">
            <Star className="w-5 h-5" />
            <span>
              Over {pools.length} Pools
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Search className="w-5 h-5" />
            <span>
              Advenced search and filters
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Calculator className="w-5 h-5" />
            <span>
              Yield calculator
            </span>
          </div>
        </div>
      </div>

      {/* Pool List */}
      <div className="space-y-4">
        {filteredPools.length === 0 && loading === false ? (
          <div className="text-center py-8 text-gray-500">
            <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No pools found matching your criteria</p>
          </div>
        ) : (
          filteredPools.map((pool, i) => (
            <div
              key={pool.poolId + `_${i}`}
              className="bg-white rounded-xl shadow-lg p-4 hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <img
                      src={pool.token0.logoURI}
                      alt={pool.token0.symbol}
                      className="w-10 h-10 rounded-full"
                    />
                    <img
                      src={pool.token1.logoURI}
                      alt={pool.token1.symbol}
                      className="w-10 h-10 rounded-full -ml-2"
                    />
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-gray-800">
                      {pool.token0.symbol}/{pool.token1.symbol}
                    </h4>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span>{Number(pool.feeTier) / 10_000}% Fee</span>
                      <span>•</span>
                      <img
                        src={pool.chain.logoURI}
                        alt={pool.chain.name}
                        className="w-4 h-4"
                      />
                      <span>{pool.chain.name}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center space-x-2 mb-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-xl font-bold text-green-600">
                      {pool.apy}%
                    </span>
                    <span className="text-sm text-gray-500">APR</span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>
                      TVL: {formatLargeNumber(pool.totalValueLockedUSD)}
                    </span>
                    <span>Vol: {formatLargeNumber(pool.volume24h)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>24h Fees: {formatLargeNumber(pool.fee24h)}</span>
                  {/* <span>Liquidity: {formatLargeNumber(parseInt(pool.))}</span> */}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    className="flex items-center space-x-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                    onClick={() => {
                      navigate(
                        `/estimate?chainId=${pool.chain.id}&poolAddress=${pool.poolId}`
                      );
                    }}
                  >
                    <Calculator className="w-4 h-4" />
                    <span>Estimate earnings</span>
                  </button>
                  <button className="p-1.5 text-gray-500 hover:text-gray-700 transition-colors">
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* <CandleStickChart data={pool} /> */}
              {/* <LiquidityPositionChart state={{
                poolTicks: [{ tickIdx: 'string', liquidityNet: '0' }],
                pool: pool,
                token0: { symbol: pool.token0.symbol, decimals: pool.token0.decimals },
                token1: { symbol: pool.token1.symbol, decimals: pool.token1.decimals },
                isPairToggled: false,
                priceAssumptionValue: 0,
                priceRangeValue: [0, 0],
                isFullRange: false
              }}  /> */}

              {/* <CorrelationChart
                key={`correlation-chart-${pool.poolId}`}
                state={{
                  token0PriceChart: {
                    prices: [
                      {
                        timestamp: new Date("2023-01-01").getTime(),
                        value: 10,
                      },
                      {
                        timestamp: new Date("2023-01-02").getTime(),
                        value: 6,
                      },
                      {
                        timestamp: new Date("2023-01-03").getTime(),
                        value: 4,
                      },
                    ],
                  },
                  token1PriceChart: {
                    prices: [
                      {
                        timestamp: new Date("2023-01-01").getTime(),
                        value: 20,
                      },
                      {
                        timestamp: new Date("2023-01-02").getTime(),
                        value: 21,
                      },
                      {
                        timestamp: new Date("2023-01-03").getTime(),
                        value: 22,
                      },
                    ],
                  },

                  priceAssumptionValue: 3.5,
                  priceRangeValue: [2.5, 5],
                  isFullRange: false,
                }}
              /> */}
            </div>
          ))
        )}
      </div>

      {loading && (
        <div className="text-center py-16">
          <div className="relative inline-block mb-4">
            <svg
              className="animate-spin h-16 w-16 text-blue-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-6 bg-blue-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          <p className="text-gray-500 font-medium">Loading pools...</p>
        </div>
      )}
    </>
  );
};
