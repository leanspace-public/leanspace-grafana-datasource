import { DataSourcePluginOptionsEditorProps } from '@grafana/data';

import React, { ChangeEvent, PureComponent } from 'react';
import { DataSourceOptions, SecureJsonData } from '../types';
import { LegacyForms } from '@grafana/ui';

const { FormField, SecretFormField } = LegacyForms;

interface Props extends DataSourcePluginOptionsEditorProps<DataSourceOptions, SecureJsonData> {}

interface State {}

export class ConfigEditor extends PureComponent<Props, State> {
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
  onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onOptionsChange, options } = this.props;
    const jsonData = {
      ...options.jsonData,
      [event.target.name]: event.target.value,
    };
    onOptionsChange({ ...options, jsonData });
  };

  render() {
    const { options } = this.props;
    const { jsonData, secureJsonData, secureJsonFields } = options;
    return (
      <div className="gf-form-group">
        <div className="gf-form">
          <FormField
            label="Environment"
            labelWidth={6}
            inputWidth={20}
            name="env"
            onChange={this.onChange}
            value={jsonData.env || ''}
            placeholder="Environment from leanspace"
          />
        </div>
        <div className="gf-form">
          <FormField
            label="Tenant"
            labelWidth={6}
            inputWidth={20}
            name="tenant"
            onChange={this.onChange}
            value={jsonData.tenant || ''}
            placeholder="Tenant from leanspace"
          />
        </div>
        <div className="gf-form">
          <SecretFormField
            label="CLient ID"
            labelWidth={6}
            inputWidth={20}
            name="clientId"
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
              labelWidth={6}
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
