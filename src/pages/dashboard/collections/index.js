import Layout from '@/components/Layout';
import Metaheader from '@/components/Metaheader';
import BreadCrumbs from '@/components/dashboard/BreadCrumbs';
import MainScreenObject from '@/components/dashboard/MainScreenObject';
import { AppContext } from '@/contexts/AppContext';
import collectionsModel from '@/models/collectionsModel';
import React, { useContext } from 'react';

function ListCollections() {
  const { state, dispatch } = useContext(AppContext);
  const urlGetRecords = `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/collections/list`;
  const urlNewRecord = `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/collections/new`;
  const urlUpdateRecord = `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/collections/update`;
  return (
    <>
      <Metaheader title="Collections List | Vidashy" />
      <Layout theme={state.theme}>
        <BreadCrumbs
          theme={state.theme}
          data={{
            links: [
              { href: '/dashboard', title: 'Home' },
              { href: false, title: 'Collections' },
            ],
          }}
        />
        <MainScreenObject
          urlGetRecords={urlGetRecords}
          urlNewRecord={urlNewRecord}
          urlUpdateRecord={urlUpdateRecord}
          tablePageSize={5}
          model={collectionsModel}
          tableComponentData={{
            title: 'Collections List',
            button: {
              label: 'New Collection',
            },
            columns: [
              { key: 'expand', label: '' },
              { key: 'id', label: 'Collection ID' },
              { key: 'name', label: 'Collection' },
              { key: 'date', label: 'Date' },
              { key: 'status', label: 'Status' },
            ],
          }}
          showSearch={true}
          modalComponentData={{
            title: 'Collection Details',
          }}
          schema={{
            fields: [
              {
                key: 'id',
                label: 'Collection ID',
                type: 'hidden',
              },
              {
                key: 'name',
                label: 'Collection Name',
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
              {
                key: 'organization_id',
                label: 'Organization',
                type: 'autocomplete',
                isRequired: true,
                placeholder: 'Choose an organization',
                items: '{{listRecords}}',
              },
            ],
          }}
        />
      </Layout>
    </>
  );
}

ListCollections.auth = { adminOnly: true };
export default ListCollections;
