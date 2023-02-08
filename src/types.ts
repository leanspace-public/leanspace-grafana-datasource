import { DataQuery, DataSourceJsonData } from '@grafana/data';

export interface MyQuery extends DataQuery {
  dimension: string;
  type: number;
  granularity: string;
  jsonString: string;
}

export const DEFAULT_QUERY: Partial<MyQuery> = {
  dimension: 'timestamp',
  type: 0,
  granularity: 'hour',
  jsonString: '{}',
};

/**
 * These are options configured for each DataSource instance
 */
export interface DataSourceOptions extends DataSourceJsonData {
  env: string;
  tenant: string;
  clientSecret: string;
  clientId: string;
  apiEnv: string;
}

/**
 * Value that is used in the backend, but never sent over HTTP to the frontend
 */
export interface SecureJsonData {
  clientSecret: string;
  clientId: string;
}
export interface DataSourceResponse {
  data: DataPoint[];
  nextToken: string;
}
export interface DataPoint {
  ingested_at: string;
  ingestion_id: string;
  metric_id: string;
  principal: string;
  received_at: string;
  result: string;
  timestamp: string;
  value: number;
}
