import Layout from '@/components/Layout';
import Metaheader from '@/components/Metaheader';
import React, { useContext, useEffect } from 'react';
import BreadCrumbs from '@/components/dashboard/BreadCrumbs';
import userModel from '@/models/userModel';
import MainScreenObject from '@/components/dashboard/MainScreenObject';
import { Chip } from '@nextui-org/react';
import Image from 'next/image';
import { formatDate, capitalizeFirstLetter, shortUUID } from '@/utils/utils';
import { AppContext } from '@/contexts/AppContext';

function ListUsers() {
  const { state, dispatch } = useContext(AppContext);
  const urlGetRecords = `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/users/list`;
  const urlNewRecord = `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/users/new`;
  const urlUpdateRecord = `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/users/update`;
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
      case 'role':
        const statusColorMap = {
          admin: 'success',
          regular: 'danger',
        };
        return (
          <>
            {cellValue ? (
              <Chip
                className="capitalize"
                color={statusColorMap[record.role]}
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
      <Metaheader title="Users List | Vidashy" />
      <Layout theme={state.theme}>
        <BreadCrumbs
          theme={state.theme}
          data={{
            links: [
              { href: '/dashboard', title: 'Home' },
              { href: false, title: 'Users' },
            ],
          }}
        />
        <MainScreenObject
          urlGetRecords={urlGetRecords}
          urlNewRecord={urlNewRecord}
          urlUpdateRecord={urlUpdateRecord}
          tablePageSize={5}
          model={userModel}
          tableComponentData={{
            title: 'Users List',
            button: {
              label: 'New User',
            },
            columns: [
              { key: 'expand', label: '' },
              { key: 'id', label: 'User ID' },
              { key: 'name', label: 'Name' },
              { key: 'role', label: 'Role' },
              { key: 'date', label: 'Date' },
            ],
            renderCell,
          }}
          showSearch={true}
          modalComponentData={{
            title: 'User Details',
          }}
          schema={{
            fields: [
              {
                key: 'id',
                label: 'User ID',
                type: 'hidden',
              },
              {
                key: 'name',
                label: 'Name',
                type: 'text',
                isRequired: true,
              },
              {
                key: 'username',
                label: 'Username',
                type: 'text',
                isRequired: true,
              },
              {
                key: 'email',
                label: 'Email',
                type: 'text',
                isRequired: true,
              },
              {
                key: 'password',
                label: 'Password',
                type: 'password',
                isRequired: true,
              },
              {
                key: 'role',
                label: 'Role',
                type: 'select',
                isRequired: true,
                items: [
                  { value: 'admin', label: 'Admin' },
                  { value: 'regular', label: 'Regular' },
                ],
              },
            ],
          }}
        />
      </Layout>
    </>
  );
}

ListUsers.auth = { adminOnly: true };
export default ListUsers;
