import { useEffect, useRef, useState } from "react";
import {
  averageArray,
  findMax,
  findMin,
  processPriceChartData,

} from "../utils/math";
import D3CorrelationChart from "./D3CorrelationChart";


// let d3Chart: D3CorrelationChart | null = null;
export interface CorrelationChartProps {
    token0PriceChart: {
      prices: { timestamp: number; value: number }[];
    } | null;
    token1PriceChart: {
      prices: { timestamp: number; value: number }[];
    } | null;
    priceAssumptionValue: number;
    priceRangeValue: number[];
    isFullRange: boolean;
    pool?: {
      token0: {
        priceUSD: number;
        symbol: string;
        decimals: number;
      };
      token1: {
        priceUSD: number;
        symbol: string;
        decimals: number;
      };
    };
    token0?: { symbol: string; decimals: number } | null;
    token1?: { symbol: string; decimals: number } | null;
  }
const CorrelationChart = ({ state }: {state: CorrelationChartProps}) => {

  const [data, setData] = useState<{
    x: number;
    y: number;
  }[]>([]);
  const refElement = useRef<HTMLDivElement>(null);
  const d3ChartRef = useRef<D3CorrelationChart | null>(null);

  useEffect(() => {
    if (!state.token0PriceChart || !state.token1PriceChart) return;

    const data = processPriceChartData(
      state.token0PriceChart,
      state.token1PriceChart
    );
    console.log("CorrelationChart data", data);
    setData(data);

    let width = 500;
    const height = 300;
    if (refElement.current) {
      width = refElement.current.offsetWidth;
    }

    if (d3ChartRef.current) d3ChartRef.current.destroy();

    d3ChartRef.current = new D3CorrelationChart(refElement.current, {
      data,
      width,
      height,
      minRange: state.priceRangeValue[0],
      maxRange: state.priceRangeValue[1],
      mostActivePrice: state.priceAssumptionValue,
    });
    // eslint-disable-next-line
  }, [refElement, state.token0PriceChart, state.token1PriceChart]);

  useEffect(() => {
    if (!d3ChartRef.current) return;

    d3ChartRef.current.updateMostActivePriceAssumption(state.priceAssumptionValue);
  }, [state.priceAssumptionValue]);

  useEffect(() => {
    if (!d3ChartRef.current) return;

    d3ChartRef.current.updateMinMaxPriceRange(
      state.priceRangeValue[0],
      state.priceRangeValue[1],
      state.isFullRange
    );
  }, [state.priceRangeValue, state.isFullRange]);

  useEffect(() => {
    return () => {
      if (d3ChartRef.current) {
        d3ChartRef.current.destroy();
      }
    };
  }, []);
  
  if (state.token0PriceChart === null || state.token1PriceChart === null) {
    return <>...</>;
  }

  return (
<>
  <div>
    Price: {Number(state.pool?.token0.priceUSD).toFixed(2)}{" "}
    {state.token0?.symbol} / {state.token1?.symbol}
    <div ref={refElement} />
</div>

        <div>
          <div>
            <div>MIN</div>{" "}
            <span>{findMin(data.map((d) => d.y)).toFixed(4)}</span>
          </div>
          <div>
            <div>MAX</div>{" "}
            <span>{findMax(data.map((d) => d.y)).toFixed(4)}</span>
          </div>
          <div>
            <div>AVG</div>{" "}
            <span>{averageArray(data.map((d) => d.y)).toFixed(4)}</span>
          </div>
          <div className="mobile">
            <div>$$$</div>{" "}
            <span>
              {Number(state.pool?.token0.priceUSD).toFixed(2)}{" "}
              {state.token0?.symbol} / {state.token1?.symbol}
            </span>
          </div>
        </div>
</>
  );
};

export default CorrelationChart;