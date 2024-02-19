import Layout from '@/components/Layout';
import Metaheader from '@/components/Metaheader';
import { ThemeContext } from '@/contexts/ThemeContext';
import React, { useContext, useEffect } from 'react';
import BreadCrumbs from '@/components/dashboard/BreadCrumbs';
import userModel from '@/models/userModel';
import MainScreenObject from '@/components/dashboard/MainScreenObject';

function ListUsers() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const urlGetRecords = `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/users/list`;
  const urlNewRecord = `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/users/new`;
  const urlUpdateRecord = `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/users/update`;
  return (
    <>
      <Metaheader title="Users List | Vidashy" />
      <Layout theme={theme} toogleTheme={toggleTheme}>
        <BreadCrumbs
          theme={theme}
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
          }}
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
