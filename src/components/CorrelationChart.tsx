import { useEffect, useRef, useState } from "react";
import {
  averageArray,
  findMax,
  findMin,
} from "../utils/math";
import D3CorrelationChart from "./D3CorrelationChart";

export type CorrelationDataInterface = Array<{
    timestamp: number;
    price: number;
    tokenSymbol0: string;
    tokenSymbol1: string;
}>;

// let d3Chart: D3CorrelationChart | null = null;
export interface CorrelationChartProps {
  data: CorrelationDataInterface;
  priceAssumptionValue: number;
  priceRangeValue: number[];
  isFullRange: boolean;
  token0?: { symbol: string; decimals: number } | null;
  token1?: { symbol: string; decimals: number } | null;
}
const CorrelationChart = ({ state }: { state: CorrelationChartProps }) => {
  const [data, setData] = useState<
    {
      x: number;
      y: number;
    }[]
  >([]);
  const refElement = useRef<HTMLDivElement>(null);
  const d3ChartRef = useRef<D3CorrelationChart | null>(null);

  useEffect(() => {
    if (!state.data) return;
    const data = state.data.map((d) => ({
      x: d.timestamp,
      y: d.price,
    }));
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
  }, [refElement, state.data]);

  useEffect(() => {
    if (!d3ChartRef.current) return;

    d3ChartRef.current.updateMostActivePriceAssumption(
      state.priceAssumptionValue
    );
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

  if (state.data === null ) {
    return <>...</>;
  }

  return (
    <>

      {/* Statistiques en grid sobre */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <div className="text-gray-500 text-xs font-normal mb-1">MIN</div>
          <div className="text-gray-900 font-medium">
            {findMin(data.map((d) => d.y)).toFixed(4)}
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <div className="text-gray-500 text-xs font-normal mb-1">CURRENT</div>
          <div className="text-gray-900 font-medium">
            {Number(state.priceAssumptionValue).toFixed(4).toLocaleString()}
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <div className="text-gray-500 text-xs font-normal mb-1">AVG</div>
          <div className="text-gray-900 font-medium">
            {averageArray(data.map((d) => d.y)).toFixed(4)}
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <div className="text-gray-500 text-xs font-normal mb-1">MAX</div>
          <div className="text-gray-900 font-medium">
            {findMax(data.map((d) => d.y)).toFixed(4)}
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl pt-4 pb-4 mt-4 mb-4 border border-gray-200">
        <div ref={refElement} />
      </div>
    </>
  );
};

export default CorrelationChart;
