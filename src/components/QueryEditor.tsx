import { DateTime, QueryEditorProps, dateTime } from '@grafana/data';
import { DateTimePicker, LegacyForms } from '@grafana/ui';
import React, { ChangeEvent, PureComponent } from 'react';
import { DataSource } from '../datasource';
import { DataSourceOptions, MyQuery } from '../types';

const { FormField } = LegacyForms;

type Props = QueryEditorProps<DataSource, MyQuery, DataSourceOptions>;

export class QueryEditor extends PureComponent<Props> {
  onDateRangeChange = (name: string, value: DateTime) => {
    const { onChange, query } = this.props;
    onChange({ ...query, [name]: value });
  };

  onMetricChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query } = this.props;
    onChange({ ...query, metricId: event.target.value });
  };

  render() {
    const { metricId, startDateTime, endDateTime } = this.props.query;

    return (
      <div className="gf-form">
        <FormField width={4} value={metricId} onChange={this.onMetricChange} label="Metric Id" type="text" />
        <DateTimePicker
          date={dateTime(startDateTime)}
          label={'Start Date'}
          onChange={(value) => this.onDateRangeChange('startDateTime', value)}
        />
        <DateTimePicker
          label={'End Date'}
          date={dateTime(endDateTime)}
          maxDate={new Date()}
          onChange={(value) => this.onDateRangeChange('endDateTime', value)}
        />
      </div>
    );
  }
}
