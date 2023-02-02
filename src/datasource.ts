import {
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  MutableDataFrame,
  FieldType,
} from '@grafana/data';

import { MyQuery, DEFAULT_QUERY, DataSourceOptions, DataSourceResponse } from './types';
import _, { defaults } from 'lodash';
import { getBackendSrv, isFetchError } from '@grafana/runtime';
import { lastValueFrom } from 'rxjs';

export class DataSource extends DataSourceApi<MyQuery, DataSourceOptions> {
  baseUrl: string;
  constructor(instanceSettings: DataSourceInstanceSettings<DataSourceOptions>) {
    super(instanceSettings);
    this.baseUrl = instanceSettings.url!;
  }
  async query(options: DataQueryRequest<MyQuery>): Promise<DataQueryResponse> {
    const { startTime, endTime, targets } = options;
    const promises = targets.map(async (target) => {
      const query = defaults(target, DEFAULT_QUERY);
      const params = {
        filters: [{ member: 'metric_id', operator: 'equals', values: [query.metricId] }],
        order: { timestamp: 'DESC' },
        limit: 100,
        timeDimension: {
          dimension: 'timestamp',
          dateRange: [
            query?.startDateTime?.toISOString() || new Date().toISOString(),
            query?.endDateTime?.toISOString() || new Date().toISOString(),
          ],
        },
        dimensions: ['timestamp', 'value'],
      };
      const response = await this.request('metrics-repository/explore', params);
      const datapoints = response.data.data;
      if (datapoints === undefined) {
        throw new Error('Remote endpoint reponse does not contain "datapoints" property.');
      }

      const timestamps: number[] = [];
      const values: number[] = [];

      for (let i = 0; i < datapoints.length; i++) {
        if (datapoints[i].timestamp === undefined) {
          throw new Error(`Data point ${i} does not contain "Time" property`);
        }
        if (datapoints[i].value === undefined) {
          throw new Error(`Data point ${i} does not contain "Value" property`);
        }
        timestamps.push(Date.parse(datapoints[i].timestamp));
        values.push(datapoints[i].value);
      }

      return new MutableDataFrame({
        refId: query.refId,
        fields: [
          { name: 'Time', type: FieldType.time, values: timestamps },
          { name: 'Value', type: FieldType.number, values: values },
        ],
      });
    });

    return Promise.all(promises).then((data) => ({ data }));
  }
  async request(url: string, params = {}) {
    const response = getBackendSrv().fetch<DataSourceResponse>({
      url: `${this.baseUrl}/${url}`,
      method: 'POST',
      data: params,
    });
    return lastValueFrom(response);
  }

  /**
   * Checks whether we can connect to the API.
   */
  async testDatasource() {
    const defaultErrorMessage = 'Cannot connect to API';

    try {
      const response = await this.request('/healthz', {} as DataQueryRequest<MyQuery>);
      if (response.status === 200) {
        return {
          status: 'success',
          message: 'Success',
        };
      } else {
        return {
          status: 'error',
          message: response.statusText ? response.statusText : defaultErrorMessage,
        };
      }
    } catch (err) {
      let message = '';
      if (_.isString(err)) {
        message = err;
      } else if (isFetchError(err)) {
        message = 'Fetch error: ' + (err.statusText ? err.statusText : defaultErrorMessage);
        if (err.data && err.data.error && err.data.error.code) {
          message += ': ' + err.data.error.code + '. ' + err.data.error.message;
        }
      }
      return {
        status: 'error',
        message,
      };
    }
  }
}
