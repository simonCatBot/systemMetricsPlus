export interface ChartDataPoint {
  timestamp: number;
  value: number;
}

export interface LineSeriesConfig {
  name: string;
  data: ChartDataPoint[];
  color?: string;
  unit?: string;
  yAxisMin?: number;
  yAxisMax?: number;
}
