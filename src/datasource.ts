import {
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  MutableDataFrame,
  FieldType,
} from '@grafana/data';

import { MyQuery, DEFAULT_QUERY, DataSourceOptions, DataSourceResponse, DataPoint } from './types';

import isString from 'lodash/isString';
import defaults from 'lodash/defaults';
import { getBackendSrv, isFetchError } from '@grafana/runtime';
import { lastValueFrom } from 'rxjs';

const API_MAP = ['streams-repository', 'metrics-repository'];
export class DataSource extends DataSourceApi<MyQuery, DataSourceOptions> {
  baseUrl: string;
  constructor(instanceSettings: DataSourceInstanceSettings<DataSourceOptions>) {
    super(instanceSettings);
    this.baseUrl = instanceSettings.url!;
  }
  async query(options: DataQueryRequest<MyQuery>): Promise<DataQueryResponse> {
    const { targets } = options;
    const promises = targets.map(async (target) => {
      const query = defaults(target, DEFAULT_QUERY);
      const { jsonString, dimension, granularity, type } = query;
      const validJSON = JSON.parse(jsonString);
      const params = {
        ...validJSON,
        timeDimension: {
          dimension,
          dateRange: [options.range.from.toISOString(), options.range.to.toISOString()],
          [type === 0 ? 'granularity' : 'groupBy']: granularity,
        },
        limit: 1000,
      };
      const datapoints = await this.getAllData(type, params);
      const dataPointsSeries = datapoints.reduce((prevValue: any, currValue: any) => {
        for (const key of Object.keys(currValue)) {
          if (!prevValue[key]) {
            prevValue[key] = [currValue[key]];
          } else {
            prevValue[key].push(currValue[key]);
          }
        }
        return prevValue;
      }, {});
      const fields = [];
      for (const key in dataPointsSeries) {
        let fieldType = FieldType.number;
        if (key === 'timestamp') {
          fieldType = FieldType.time;
        }
        fields.push({ name: key, type: fieldType, values: dataPointsSeries[key] });
      }
      return new MutableDataFrame({
        refId: query.refId,
        fields,
      });
    });

    return Promise.all(promises).then((data) => ({ data }));
  }

  async getAllData(type: number, params: {}, responseData: DataPoint[] = []): Promise<DataPoint[]> {
    const response = await this.request(`${API_MAP[type]}/explore`, params);
    responseData = responseData.concat(response.data.data);
    if (response.data.nextToken) {
      return await this.getAllData(type, { ...params, nextToken: response.data.nextToken }, responseData);
    }
    return responseData;
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
    const params = {
      dimensions: ['timestamp'],
      order: {
        timestamp: 'DESC',
      },
      limit: 1,
      timeDimension: {
        dimension: 'timestamp',
        dateRange: ['2022-06-01T15:47:58.000Z', '2023-02-07T16:48:07.000Z'],
      },
    };
    try {
      const response = await this.request(`${API_MAP[1]}/explore`, params);
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
      if (isString(err)) {
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
