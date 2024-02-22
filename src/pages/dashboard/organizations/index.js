import Layout from '@/components/Layout';
import Metaheader from '@/components/Metaheader';
import { ThemeContext } from '@/contexts/ThemeContext';
import React, { useContext, useEffect } from 'react';
import BreadCrumbs from '@/components/dashboard/BreadCrumbs';
import organizationModel from '@/models/organizationModel';
import MainScreenObject from '@/components/dashboard/MainScreenObject';
import { Chip } from '@nextui-org/react';
import Image from 'next/image';
import { formatDate, capitalizeFirstLetter, shortUUID } from '@/utils/utils';

function ListOrganizations() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const urlGetRecords = `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/organizations/list`;
  const urlNewRecord = `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/organizations/new`;
  const urlUpdateRecord = `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/organizations/update`;
  const renderCell = (record, columnKey, showRecordDetail) => {
    const cellValue = record[columnKey];
    switch (columnKey) {
      case 'expand':
        return (
          <div
            className="expand-cell"
            onClick={() => {
              showRecordDetail(record);
            }}
          >
            <Image
              src="/assets/images/icon-expand.svg"
              width={12}
              height={12}
              alt=""
            />
          </div>
        );
      case 'status':
        const statusColorMap = {
          active: 'success',
          inactive: 'danger',
        };
        return (
          <>
            {cellValue ? (
              <Chip
                className="capitalize"
                color={statusColorMap[record.status]}
                size="sm"
                variant="flat"
              >
                {capitalizeFirstLetter(cellValue)}
              </Chip>
            ) : (
              <div></div>
            )}
          </>
        );

      case 'date':
        return <div>{formatDate(cellValue)}</div>;

      case 'id':
        return (
          <div
            style={{
              textDecoration: 'none',
              color: '#0070f0',
              cursor: 'pointer',
            }}
            onClick={() => {
              showRecordDetail(record);
            }}
          >
            {shortUUID(cellValue)}
          </div>
        );

      default:
        return cellValue;
    }
  };
  return (
    <>
      <Metaheader title="Organizations List | Vidashy" />
      <Layout theme={theme} toogleTheme={toggleTheme}>
        <BreadCrumbs
          theme={theme}
          data={{
            links: [
              { href: '/dashboard', title: 'Home' },
              { href: false, title: 'Organizations' },
            ],
          }}
        />
        <MainScreenObject
          urlGetRecords={urlGetRecords}
          urlNewRecord={urlNewRecord}
          urlUpdateRecord={urlUpdateRecord}
          tablePageSize={5}
          model={organizationModel}
          tableComponentData={{
            title: 'Organizations List',
            button: {
              label: 'New Organization',
            },
            columns: [
              { key: 'expand', label: '' },
              { key: 'id', label: 'Organization ID' },
              { key: 'name', label: 'Organization' },
              { key: 'date', label: 'Date' },
              { key: 'status', label: 'Status' },
            ],
            renderCell,
          }}
          modalComponentData={{
            title: 'Organization Details',
          }}
          schema={{
            fields: [
              {
                key: 'id',
                label: 'Organization ID',
                type: 'hidden',
              },
              {
                key: 'name',
                label: 'Organization Name',
                type: 'text',
                isRequired: true,
              },
              {
                key: 'status',
                label: 'Status',
                type: 'select',
                isRequired: true,
                items: [
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' },
                ],
              },
            ],
          }}
        />
      </Layout>
    </>
  );
}

ListOrganizations.auth = { adminOnly: true };
export default ListOrganizations;
