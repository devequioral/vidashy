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

const getOrganization = async (id) => {
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/organizations/get?id=${id}`;
  return await fetch(url);
};

function ListCollections() {
  const router = useRouter();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [urlRecords, setUrlRecords] = useState();
  const [organization, setCurrentOrganization] = useState({ name: '' });

  useEffect(() => {
    const fetchOrganizations = async () => {
      if (!router.query.id) return;
      const idOrganization = router.query.id;
      const response = await getOrganization(idOrganization);
      if (response.ok) {
        const resp_json = await response.json();
        const _organization = resp_json.data.records[0];

        setUrlRecords({
          get: `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/collections/list?organization_id=${_organization.id}`,
          new: `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/collections/new?organization_id=${_organization.id}`,
          update: `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/collections/update?organization_id=${_organization.id}`,
        });
        setCurrentOrganization(_organization);
      }
    };
    fetchOrganizations();
  }, [router.query.id]);
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
              { href: false, title: organization.name },
            ],
          }}
        />
        {organization.id && urlRecords && (
          <MainScreenObject
            urlGetRecords={urlRecords.get}
            urlNewRecord={urlRecords.new}
            urlUpdateRecord={urlRecords.update}
            tablePageSize={5}
            model={collectionsModel}
            tableComponentData={{
              title: `Collections List of ${organization.name}`,
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
                  type: 'hidden',
                  isRequired: true,
                  placeholder: 'Choose an organization',
                  value: organization.id,
                },
              ],
            }}
          />
        )}
      </Layout>
    </>
  );
}

ListCollections.auth = { adminOnly: true };
export default ListCollections;
