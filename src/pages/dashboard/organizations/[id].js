import Layout from '@/components/Layout';
import Metaheader from '@/components/Metaheader';
import { ThemeContext } from '@/contexts/ThemeContext';
import React, { useContext, useEffect, useState } from 'react';
import BreadCrumbs from '@/components/dashboard/BreadCrumbs';
import collectionsModel from '@/models/collectionsModel';
import MainScreenObject from '@/components/dashboard/MainScreenObject';
import { useRouter } from 'next/router';
import { formatDate, capitalizeFirstLetter, shortUUID } from '@/utils/utils';
import Image from 'next/image';
import { Chip } from '@nextui-org/react';

const listOrganizations = async () => {
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/organizations/list`;
  return await fetch(url);
};

function ListCollections() {
  const router = useRouter();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const urlGetRecords = `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/collections/list`;
  const urlNewRecord = `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/collections/new`;
  const urlUpdateRecord = `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/collections/update`;
  const [organizations, setOrganizations] = useState([]);
  const [currentOrganization, setCurrentOrganization] = useState('');
  const idOrganization = router.query.id;
  useEffect(() => {
    const fetchOrganizations = async () => {
      const response = await listOrganizations();
      if (response.ok) {
        const resp_json = await response.json();
        const _organizations = [];
        if (!resp_json.data.records) return;
        resp_json.data.records.map((record, i) => {
          _organizations.push({
            label: record.name,
            value: record.id,
          });
          if (record.id === idOrganization) {
            setCurrentOrganization(record.name);
          }
        });
        setOrganizations(_organizations);
      }
    };
    fetchOrganizations();
  }, []);
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

      case 'organization_id':
        return <div>{cellValue}</div>;

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
      <Metaheader title="Collections List | Vidashy" />
      <Layout theme={theme} toogleTheme={toggleTheme}>
        <BreadCrumbs
          theme={theme}
          data={{
            links: [
              { href: '/dashboard', title: 'Home' },
              { href: '/dashboard/organizations', title: 'Collections' },
              { href: false, title: currentOrganization || idOrganization },
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
            title: `Collections List of ${
              currentOrganization || idOrganization
            }`,
            button: {
              label: 'New Collection',
            },
            columns: [
              { key: 'expand', label: '' },
              { key: 'id', label: 'Collection ID' },
              { key: 'name', label: 'Name' },
              { key: 'date', label: 'Date' },
              { key: 'status', label: 'Status' },
            ],
            renderCell,
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
                items: organizations,
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
