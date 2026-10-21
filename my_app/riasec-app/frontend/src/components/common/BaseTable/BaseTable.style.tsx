import styled from 'styled-components';
import { Table as AntdTable } from 'antd';

export const Table = styled(AntdTable)`
  & thead .ant-table-cell {
    color: var(--primary-color);
    font-size: 1.125rem
    font-weight: 600;
    line-height: 1.5rem;
    text-align: center !important;
    padding-top: 0.875rem !important;
    padding-bottom: 0.875rem !important;
    & .anticon {
      color: var(--primary-color);
      font-size: 1.125rem
    }
  }

  & tbody .ant-table-cell {
    color: var(--text-main-color);
    font-size: 1.125rem
    line-height: 1.5rem;
    white-space: normal;
    word-break: break-word;
    padding-top: 0.75rem !important;
    padding-bottom: 0.75rem !important;
  }

  & tbody tr.ant-table-row:nth-child(even) > td.ant-table-cell {
    background-color: var(--background-color, #fafafa);
  }

  & tbody tr.ant-table-row:hover > td.ant-table-cell {
    background-color: var(--primary-1, #e6f4ff) !important;
    cursor: pointer;
  }

  & tbody .ant-table-row-expand-icon {
    min-height: 1.5rem;
    min-width: 1.5rem;
    border-radius: 0.1875rem;
    margin-top: 0;
  }

  &
    .ant-table-thead
    > tr
    > th:not(:last-child):not(.ant-table-selection-column):not(.ant-table-row-expand-icon-cell):not([colspan])::before {
    background-color: var(--primary-color);
  }

  & .ant-pagination-prev,
  .ant-pagination-next,
  .ant-pagination-jump-prev,
  .ant-pagination-jump-next,
  .ant-pagination-item {
    min-width: 2.75rem;
    height: 2.75rem;
    line-height: 2.75rem;
    border-radius: 0.25rem;
    font-size: 1.125rem
    margin: 0 0.125rem;
  }

  & .ant-pagination-prev .ant-pagination-item-link,
  .ant-pagination-next .ant-pagination-item-link {
    border-radius: 0.25rem;
  }

  & .ant-checkbox-inner {
    border-radius: 0.25rem;
    height: 1.5rem;
    width: 1.5rem;
    border: 2px solid var(--primary-color);
  }

  & .editable-row .ant-form-item-explain {
    top: 100%;
    font-size: 1rem
  }

  .ant-table-column-sort {
    background-color: transparent;
  }

  & .ant-table-cell-fix-left,
  & .ant-table-cell-fix-right,
  & .ant-table-cell-fix-left-last,
  & .ant-table-cell-fix-right-first {
    background-color: var(--background-color, #ffffff) !important;
  }

  & .ant-table-thead > tr > th.ant-table-cell-fix-left,
  & .ant-table-thead > tr > th.ant-table-cell-fix-right,
  & .ant-table-thead > tr > th.ant-table-cell-fix-left-last,
  & .ant-table-thead > tr > th.ant-table-cell-fix-right-first {
    background-color: #fafafa !important;
  }

  & .ant-table-tbody > tr.ant-table-row:hover > td.ant-table-cell-fix-left,
  & .ant-table-tbody > tr.ant-table-row:hover > td.ant-table-cell-fix-right,
  & .ant-table-tbody > tr.ant-table-row:hover > td.ant-table-cell-fix-left-last,
  & .ant-table-tbody > tr.ant-table-row:hover > td.ant-table-cell-fix-right-first {
    background-color: var(--primary-1, #e6f4ff) !important;
  }

  .ant-pagination-item-container .ant-pagination-item-ellipsis {
    color: var(--disabled-color);
    font-size: 1.125rem
  }

  .ant-pagination-disabled {
    .ant-pagination-item-link,
    .ant-pagination-item a {
      color: var(--disabled-color);
    }
  }

  .ant-pagination.ant-pagination-disabled {
    .ant-pagination-item-link,
    .ant-pagination-item a {
      color: var(--disabled-color);
    }
  }
`;

