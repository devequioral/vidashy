import Layout from '@/components/Layout';
import Metaheader from '@/components/Metaheader';
import { ThemeContext } from '@/contexts/ThemeContext';
import React, { useContext } from 'react';
import BreadCrumbs from '@/components/dashboard/BreadCrumbs';
import automationsModel from '@/models/automationsModel';
import MainScreenObject from '@/components/dashboard/MainScreenObject';
import { Chip } from '@nextui-org/react';
import Image from 'next/image';
import { formatDate, capitalizeFirstLetter, shortUUID } from '@/utils/utils';

async function getOrganizations() {
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/organizations/list?pageSize=1000`;
  const res = await fetch(url);
  return await res.json();
}

function ListAutomations() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const urlGetRecords = `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/automations/list`;
  const urlNewRecord = `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/automations/new`;
  const urlUpdateRecord = `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/automations/update`;
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
      <Metaheader title="Automations List | Vidashy" />
      <Layout theme={theme} toogleTheme={toggleTheme}>
        <BreadCrumbs
          theme={theme}
          data={{
            links: [
              { href: '/dashboard', title: 'Home' },
              { href: false, title: 'Automations' },
            ],
          }}
        />
        <MainScreenObject
          urlGetRecords={urlGetRecords}
          urlNewRecord={urlNewRecord}
          urlUpdateRecord={urlUpdateRecord}
          tablePageSize={5}
          model={automationsModel}
          tableComponentData={{
            title: 'Automations List',
            button: {
              label: 'New Automation',
            },
            columns: [
              { key: 'expand', label: '' },
              { key: 'id', label: 'Automation ID' },
              { key: 'trigger', label: 'Trigger' },
              { key: 'date', label: 'Date' },
              { key: 'status', label: 'Status' },
            ],
            renderCell,
          }}
          showSearch={true}
          modalComponentData={{
            title: 'Automations Details',
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
                label: 'Automation ID',
                type: 'hidden',
              },
              {
                key: 'collection',
                label: 'Collection',
                type: 'text',
                isRequired: true,
              },
              {
                key: 'object',
                label: 'Object',
                type: 'text',
                isRequired: true,
              },
              {
                key: 'trigger',
                label: 'Trigger',
                type: 'select',
                isRequired: true,
                items: [
                  { value: 'recordCreated', label: 'Record Created' },
                  { value: 'recordUpdated', label: 'Record Updated' },
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
                key: 'automations',
                label: 'Automations',
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

ListAutomations.auth = { adminOnly: true };
export default ListAutomations;
