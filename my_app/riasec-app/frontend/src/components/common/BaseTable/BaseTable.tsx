/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { TableProps } from 'antd';
import * as S from './BaseTable.style';

export type BaseTableProps<T = any> = TableProps<T>;

export function BaseTable<T extends object = any>(props: BaseTableProps<T>): React.ReactElement {
  return <S.Table {...(props as any)} />;
}
