import { DataSourcePluginOptionsEditorProps } from '@grafana/data';

import React, { ChangeEvent, PureComponent } from 'react';
import { DataSourceOptions, SecureJsonData } from '../types';
import { InlineField, LegacyForms, Select } from '@grafana/ui';

const { FormField, SecretFormField } = LegacyForms;

const environmentOptions = [
  {
    label: 'PROD',
    value: 'prod',
  },
  {
    label: 'DEMO',
    value: 'demo',
  },
  {
    label: 'DEVELOP',
    value: 'develop',
  },
];

export class ConfigEditor extends PureComponent<DataSourcePluginOptionsEditorProps<DataSourceOptions, SecureJsonData>> {
  onSecretChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onOptionsChange, options } = this.props;
    const secureJsonData = {
      ...options.secureJsonData,
      [event.target.name]: event.target.value,
    } as SecureJsonData;
    onOptionsChange({ ...options, secureJsonData });
  };
  onResetSecret = (name: string) => {
    const { onOptionsChange, options } = this.props;
    onOptionsChange({
      ...options,
      secureJsonFields: {
        ...options.secureJsonFields,
        [name]: false,
      },
      secureJsonData: {
        ...options.secureJsonData,
        [name]: '',
      } as SecureJsonData,
    });
  };
  onChange = (name: string, value: string) => {
    const { onOptionsChange, options } = this.props;

    const jsonData = {
      ...options.jsonData,
      [name]: value,
      apiEnv: name === 'env' && value === 'prod' ? '' : value + '.',
    };
    onOptionsChange({ ...options, jsonData });
  };

  render() {
    const { options } = this.props;
    const { jsonData, secureJsonData, secureJsonFields } = options;
    return (
      <div className="gf-form-group">
        <div className="gf-form">
          <InlineField labelWidth={12} label="Environment">
            <Select
              width={40}
              options={environmentOptions}
              onChange={({ value }) => value && this.onChange('env', value)}
              value={jsonData.env}
              onCreateOption={(value) => undefined}
            />
          </InlineField>
        </div>
        <div className="gf-form">
          <FormField
            label="Tenant"
            name="tenant"
            inputWidth={20}
            onChange={({ target: { value } }) => this.onChange('tenant', value)}
            value={jsonData.tenant || ''}
            placeholder="Tenant from leanspace"
          />
        </div>
        <div className="gf-form">
          <SecretFormField
            label="Client ID"
            name="clientId"
            inputWidth={20}
            onChange={this.onSecretChange}
            isConfigured={Boolean(secureJsonFields.clientId)}
            value={secureJsonData?.clientId || ''}
            placeholder="Client Id from leanspace"
            onReset={() => this.onResetSecret('clientId')}
          />
        </div>

        <div className="gf-form-inline">
          <div className="gf-form">
            <SecretFormField
              label="Client Secret"
              placeholder="Client Secret token from leanspace"
              inputWidth={20}
              isConfigured={Boolean(secureJsonFields.clientSecret)}
              name="clientSecret"
              value={secureJsonData?.clientSecret || ''}
              onChange={this.onSecretChange}
              onReset={() => this.onResetSecret('clientSecret')}
            />
          </div>
        </div>
      </div>
    );
  }
}
