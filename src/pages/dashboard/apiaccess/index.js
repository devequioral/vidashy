import Layout from '@/components/Layout';
import Metaheader from '@/components/Metaheader';
import { ThemeContext } from '@/contexts/ThemeContext';
import React, { useContext } from 'react';
import BreadCrumbs from '@/components/dashboard/BreadCrumbs';
import apiAccessModel from '@/models/apiAccessModel';
import MainScreenObject from '@/components/dashboard/MainScreenObject';
import { Chip } from '@nextui-org/react';
import Image from 'next/image';
import { formatDate, capitalizeFirstLetter, shortUUID } from '@/utils/utils';

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
  const flag = React.useRef(false);
  React.useEffect(() => {
    if (flag.current) return;
    flag.current = true;
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
              { key: 'name', label: 'Name' },
              { key: 'date', label: 'Date' },
              { key: 'status', label: 'Status' },
            ],
            renderCell,
          }}
          modalComponentData={{
            title: 'Api Access Details',
          }}
          schema={{
            fields: [
              {
                key: 'organization_id',
                label: 'Organization',
                type: 'autocomplete',
                isRequired: true,
                placeholder: 'Choose an organization',
                items: organizations,
              },
              {
                key: 'id',
                label: 'Api Access ID',
                type: 'hidden',
              },
              {
                key: 'name',
                label: 'Name',
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
                key: 'apiaccess',
                label: 'Permissions',
                type: 'json',
                isRequired: true,
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
