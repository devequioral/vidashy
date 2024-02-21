import Layout from '@/components/Layout';
import Metaheader from '@/components/Metaheader';
import { ThemeContext } from '@/contexts/ThemeContext';
import React, { useContext } from 'react';
import BreadCrumbs from '@/components/dashboard/BreadCrumbs';
import apiAccessModel from '@/models/apiAccessModel';
import MainScreenObject from '@/components/dashboard/MainScreenObject';

async function getOrganizations() {
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/organizations/list?pageSize=1000`;
  const res = await fetch(url);
  return await res.json();
}

function ListApiAccess() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const urlGetRecords = `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/apiaccess/list`;
  const urlNewRecord = `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/apiaccess/new`;
  const urlUpdateRecord = `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/apiaccess/update`;
  const [organizations, setOrganizations] = React.useState([]);
  React.useEffect(() => {
    async function fetchOrganizations() {
      const organizationsDB = await getOrganizations();
      if (
        organizationsDB &&
        organizationsDB.data &&
        organizationsDB.data.records
      ) {
        organizationsDB.data.records.map((organization) => {
          const newOrganization = {
            label: organization.name,
            value: organization.id,
          };
          setOrganizations((prev) => [...prev, newOrganization]);
        });
      }
    }
    fetchOrganizations();
  }, []);
  return (
    <>
      <Metaheader title="ApiAccess List | Vidashy" />
      <Layout theme={theme} toogleTheme={toggleTheme}>
        <BreadCrumbs
          theme={theme}
          data={{
            links: [
              { href: '/dashboard', title: 'Home' },
              { href: false, title: 'ApiAccess' },
            ],
          }}
        />
        <MainScreenObject
          urlGetRecords={urlGetRecords}
          urlNewRecord={urlNewRecord}
          urlUpdateRecord={urlUpdateRecord}
          tablePageSize={5}
          model={apiAccessModel}
          tableComponentData={{
            title: 'Apiaccess List',
            button: {
              label: 'New Api Access',
            },
            columns: [
              { key: 'expand', label: '' },
              { key: 'id', label: 'Api Access ID' },
              { key: 'name', label: 'Api Access' },
              { key: 'date', label: 'Date' },
              { key: 'status', label: 'Status' },
            ],
          }}
          modalComponentData={{
            title: 'Api Access Details',
          }}
          schema={{
            fields: [
              {
                key: 'id',
                label: 'Api Access ID',
                type: 'hidden',
              },
              {
                key: 'name',
                label: 'Api Access Name',
                type: 'text',
                isRequired: true,
              },
              {
                key: 'description',
                label: 'Description',
                type: 'text',
                isRequired: true,
              },
              {
                key: 'client_collection',
                label: 'Collection',
                type: 'autocomplete',
                isRequired: true,
                placeholder: 'Choose a Collection',
                items: [],
              },
              {
                key: 'object',
                label: 'Object',
                type: 'text',
                isRequired: true,
              },
              {
                key: 'methods',
                label: 'Methods',
                type: 'select',
                isRequired: true,
                selectionMode: 'multiple',
                items: [
                  { value: 'GET', label: 'GET' },
                  { value: 'POST', label: 'POST' },
                  { value: 'PATCH', label: 'PATCH' },
                  { value: 'DELETE', label: 'DELETE' },
                  { value: 'PUT', label: 'PUT' },
                ],
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
              {
                key: 'organization_id',
                label: 'Organization',
                type: 'autocomplete',
                isRequired: true,
                placeholder: 'Choose an organization',
                items: organizations,
              },
            ],
          }}
        />
      </Layout>
    </>
  );
}

ListApiAccess.auth = { adminOnly: true };
export default ListApiAccess;
