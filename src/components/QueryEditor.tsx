import { DateTime, QueryEditorProps } from '@grafana/data';
import { InlineField, RadioButtonGroup, Select, TextArea } from '@grafana/ui';
import defaults from 'lodash/defaults';
import React, { PureComponent } from 'react';
import { DataSource } from '../datasource';
import { DEFAULT_QUERY, DataSourceOptions, MyQuery } from '../types';

type Props = QueryEditorProps<DataSource, MyQuery, DataSourceOptions>;
const typeOptions = [
  { label: 'Streams', value: 0 },
  { label: 'Metrics', value: 1 },
];
const granularityOptions = [
  { label: 'raw', value: 'raw' },
  { label: 'second', value: 'second' },
  { label: 'minute', value: 'minute' },
  { label: 'hour', value: 'hour' },
  { label: 'day', value: 'day' },
];
const dimentionOptions = [
  { label: 'timestamp', value: 'timestamp' },
  { label: 'arrived_at', value: 'arrived_at', notForMetric: true },
  { label: 'received_at', value: 'received_at' },
  { label: 'processed_at', value: 'processed_at', notForMetric: true },
  { label: 'ingested_at', value: 'ingested_at' },
];

export class QueryEditor extends PureComponent<Props> {
  onDateRangeChange = (name: string, value: DateTime) => {
    const { onChange, query } = this.props;
    onChange({ ...query, [name]: value });
  };

  onChange = (name: string, value: number | string) => {
    const { onChange, query } = this.props;
    onChange({ ...query, [name]: value });
  };

  render() {
    const { dimension, granularity, jsonString, type } = defaults(this.props.query, DEFAULT_QUERY);
    return (
      <div className="gf-form">
        <RadioButtonGroup options={typeOptions} value={type} onChange={(type) => this.onChange('type', type)} />
        <InlineField label={type === 1 ? 'Group By' : 'Granularity'}>
          <Select
            options={granularityOptions}
            onChange={({ value }) => value && this.onChange('granularity', value)}
            value={granularity}
            onCreateOption={(value) => undefined}
          />
        </InlineField>
        <InlineField label="Dimension">
          <Select
            value={dimension}
            options={type === 1 ? dimentionOptions.filter((dim) => !dim.notForMetric) : dimentionOptions}
            onCreateOption={() => undefined}
            onChange={({ value }) => {
              value && this.onChange('dimension', value);
            }}
          />
        </InlineField>
        <InlineField label="Valid JSON">
          <TextArea
            value={jsonString}
            label="Valid JSON"
            onChange={({ currentTarget: { value } }) => this.onChange('jsonString', value)}
          />
        </InlineField>
      </div>
    );
  }
}
