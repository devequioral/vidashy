import Layout from '@/components/Layout';
import Metaheader from '@/components/Metaheader';
import React, { useContext, useEffect, useState } from 'react';
import BreadCrumbs from '@/components/dashboard/BreadCrumbs';
import apiAccessModel from '@/models/apiAccessModelv2';
import MainScreenObject from '@/components/dashboard/MainScreenObject';
import ModalComponent from '@/components/dashboard/ModalComponent';
import {
  Autocomplete,
  AutocompleteItem,
  AutocompleteSection,
  Button,
  Chip,
  Input,
  Snippet,
} from '@nextui-org/react';
import Image from 'next/image';
import { formatDate, capitalizeFirstLetter, shortUUID } from '@/utils/utils';
import { AppContext } from '@/contexts/AppContext';

async function getOrganizations() {
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/organizations/list?pageSize=1000`;
  const res = await fetch(url);
  return await res.json();
}

async function getCollections() {
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/collections/list?pageSize=1000`;
  const res = await fetch(url);
  return await res.json();
}

function ModalApiKeyViewOnly({ show, apikey, onClose }) {
  const [showModal, setShowModal] = useState(0);
  useEffect(() => {
    if (show > 0) {
      setShowModal(show);
    }
  }, [show]);
  return (
    <ModalComponent
      show={showModal}
      title={'Your Api Key has been created'}
      onCloseModal={() => {
        setShowModal(0);
        onClose();
      }}
      showButtonSave={false}
      size={'xl'}
    >
      <div className={'ModalApiKeyViewOnlyBody'}>
        <p>
          This api key will show one time. Copy now and save in a safe place.
        </p>
        <p>
          Use this api key for your own developments. Do not share with services
          and third parties.
        </p>
        <Snippet symbol="">{apikey}</Snippet>
        <style jsx>
          {`
            .ModalApiKeyViewOnlyBody p {
              font-size: 12px;
              margin: 15px;
              font-weight: 500;
            }
          `}
        </style>
      </div>
    </ModalComponent>
  );
}

function AccessComponent(props) {
  const { record, validation, key, items, clear, defaultValue } = {
    ...props,
  };
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [access, setAccess] = useState(items);
  const [changes, setChanges] = useState(0);
  const onFieldChange = (value) => {
    items.sections.map((section) => {
      section.items.map((item) => {
        if (item.key === value) item.selected = true;
      });
    });
    setAccess((c) => {
      return { ...c, ...items };
    });
    setChanges((c) => c + 1);
    setShowAutocomplete(false);
  };
  const removeAccess = (value) => {
    items.sections.map((section) => {
      section.items.map((item) => {
        if (item.key === value) {
          item.selected = false;
        }
      });
    });
    setAccess((c) => {
      return { ...c, ...items };
    });
    setChanges((c) => c + 1);
  };
  useEffect(() => {
    if (changes === 0) return;
    const recordAccess = [];
    access.sections.map((section) => {
      section.items.map((item) => {
        if (item.selected) {
          recordAccess.push(item.key);
        }
      });
    });
    record.access = recordAccess;
  }, [changes]);

  useEffect(() => {
    if (clear === 0) return;
    const _access = { ...access };
    _access.sections.map((section) => {
      section.items.map((item) => {
        item.selected = false;
      });
    });
    setAccess(_access);
    setChanges(0);
  }, [clear]);

  const verifyItemsIs = (_items, compare) => {
    let resp = false;
    _items.map((item) => {
      if (item.selected === compare) resp = true;
    });
    return resp;
  };

  useEffect(() => {
    if (!defaultValue || defaultValue.length == 0) return;
    items.sections.map((section) => {
      section.items.map((item) => {
        if (defaultValue.indexOf(item.key) >= 0) item.selected = true;
      });
    });
    setAccess((c) => {
      return { ...c, ...items };
    });
  }, [defaultValue]);

  return (
    <div className="AccessComponent">
      <div className="AccessComponentSelections">
        <h4>Access</h4>
        <h5>The Api Key have access to following Collections</h5>
        {access.sections.map(
          (section, i) =>
            verifyItemsIs(section.items, true) && (
              <div className="AccessComponentSection" key={i}>
                <h6>{section.title}</h6>
                {section.items.map(
                  (access, ii) =>
                    access.selected && (
                      <Chip
                        style={{
                          background: 'none',
                          width: '100%',
                          maxWidth: '100%',
                          fontSize: '12px',
                        }}
                        key={ii}
                        onClose={() => removeAccess(access.key)}
                      >
                        {access.label}
                      </Chip>
                    )
                )}
              </div>
            )
        )}
      </div>
      {showAutocomplete && (
        <Autocomplete
          label="Access"
          placeholder="Enter Access"
          className="max-w-xs"
          isRequired={true}
          isInvalid={validation[key] ? true : false}
          errorMessage={validation[key]}
          onSelectionChange={(value, b) => {
            onFieldChange(value);
          }}
          defaultSelectedKey={record && record[key]}
          menuTrigger="focus"
          autoFocus={true}
        >
          {access.sections.map(
            (section, i) =>
              verifyItemsIs(section.items, false) && (
                <AutocompleteSection showDivider title={section.title} key={i}>
                  {section.items.map(
                    (item, ii) =>
                      !item.selected && (
                        <AutocompleteItem key={item.key}>
                          {item.label}
                        </AutocompleteItem>
                      )
                  )}
                </AutocompleteSection>
              )
          )}
        </Autocomplete>
      )}
      {validation.access && (
        <div className={'text-tiny text-danger mb-5'}>{validation.access}</div>
      )}
      <Button
        color={'primary'}
        size={'sm'}
        onClick={() => setShowAutocomplete(true)}
      >
        Add Collection
      </Button>

      <style jsx>
        {`
          .AccessComponent {
            margin-bottom: 30px;
          }
          .AccessComponentSelections {
            display: flex;
            flex-direction: column;
            width: 100%;
            gap: 10px;
            font-size: 12px;
            margin: 30px 0;
          }
          .AccessComponentSelections h4 {
            font-size: 14px;
            font-weight: 600;
          }
          .AccessComponentSelections h5 {
            font-size: 12px;
            font-weight: 500;
          }
          .AccessComponentSection {
            padding: 5px 10px;
          }
          .AccessComponentSection h6 {
            font-weight: 600;
          }
          .AccessComponentSelection {
            background: none;
            width: 100%;
            max-width: 100%;
            margin: 0;
          }
        `}
      </style>
    </div>
  );
}

function ListApiAccess() {
  const { state, dispatch } = useContext(AppContext);
  const urlGetRecords = `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/apiaccessv2/list`;
  const urlNewRecord = `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/apiaccessv2/new`;
  const urlUpdateRecord = `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/apiaccessv2/update`;
  const urlDeleteRecord = `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/apiaccessv2/delete?id={record_id}`;
  const [organizations, setOrganizations] = useState([]);
  const [collections, setCollections] = useState([]);
  const [accessOptions, setAccessOptions] = useState([]);
  const [showModalApiKeyViewOnly, setShowModalApiKeyViewOnly] = useState(0);
  const [lastApiKey, setLastApiKey] = useState('');
  const [clearAccessComponent, setClearAccessComponent] = useState(0);
  const flag = React.useRef(false);
  async function fetchOrganizations() {
    const organizationsDB = await getOrganizations();
    if (
      organizationsDB &&
      organizationsDB.data &&
      organizationsDB.data.records
    ) {
      organizationsDB.data.records.map((organization) => {
        const newOrganization = {
          id: organization.id,
          name: organization.name,
        };
        setOrganizations((prev) => [...prev, newOrganization]);
      });
    }
  }
  async function fetchCollections() {
    const collectionsDB = await getCollections();
    if (collectionsDB && collectionsDB.data && collectionsDB.data.records) {
      collectionsDB.data.records.map((collection) => {
        const newCollection = {
          id: collection.id,
          name: collection.name,
          organization_id: collection.organization_id,
        };
        setCollections((prev) => [...prev, newCollection]);
      });
    }
  }
  useEffect(() => {
    if (flag.current) return;
    flag.current = true;

    fetchOrganizations();
    fetchCollections();
  }, []);

  useEffect(() => {
    if (!organizations.length === 0) return;
    if (!collections.length === 0) return;
    const _access = {
      sections: [
        {
          title: 'All Organizations',
          key: 0,
          items: [
            {
              key: 'ALL_ORGANIZATIONS',
              label: 'All current and future organizations ',
              selected: false,
            },
          ],
        },
      ],
    };
    organizations.map((organization, i) => {
      const section = { title: organization.name, items: [], key: i + 1 };
      collections.map((collection, ii) => {
        if (ii == 0) {
          section.items.push({
            key: `ALL_COLLECTIONS:${organization.id}`,
            label: 'All current and future Collections of this Organization',
            selected: false,
          });
        }
        if (collection.organization_id === organization.id) {
          section.items.push({
            key: collection.id,
            label: collection.name,
            selected: false,
          });
        }
      });
      _access.sections.push(section);
    });
    setAccessOptions(_access);
  }, [collections, organizations]);

  const renderCell = (record, columnKey, showRecordDetail, showModalDelete) => {
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

      case 'actions':
        return (
          <Button
            isIconOnly={true}
            size="sm"
            color="danger"
            onClick={() => showModalDelete(record)}
            startContent={
              <Image
                src="/assets/images/icon-delete.svg"
                width={18}
                height={18}
                alt="Delete"
              />
            }
          />
        );

      default:
        return cellValue;
    }
  };
  const afterSafe = (resp) => {
    setClearAccessComponent((c) => c + 1);
    if (resp.apikey) {
      setShowModalApiKeyViewOnly((c) => c + 1);
      setLastApiKey(resp.apikey);
    }
  };
  const onCloseModalApiKeyViweOnly = () => {
    setLastApiKey('');
  };
  return (
    <>
      <Metaheader title="ApiAccess List | Vidashy" />
      <Layout theme={state.theme}>
        <BreadCrumbs
          theme={state.theme}
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
          urlDeleteRecord={urlDeleteRecord}
          tablePageSize={5}
          model={apiAccessModel}
          tableComponentData={{
            title: 'Apiaccess List',
            button: {
              label: 'New Api Access',
            },
            columns: [
              { key: 'expand', label: '' },
              { key: 'name', label: 'Name' },
              { key: 'date', label: 'Date' },
              { key: 'status', label: 'Status' },
              { key: 'actions', label: '' },
            ],
            renderCell,
          }}
          showSearch={true}
          modalComponentData={{
            title: 'Api Access Details',
          }}
          modalSize="xl"
          schema={{
            fields: [
              {
                key: 'name',
                label: 'Name',
                type: 'text',
                isRequired: true,
                labelPlacement: 'outside',
              },
              {
                key: 'description',
                label: 'Description',
                type: 'text',
                isRequired: true,
                labelPlacement: 'outside',
              },
              {
                key: 'scope',
                label: 'Scope',
                type: 'select',
                isRequired: true,
                labelPlacement: 'outside',
                items: [
                  {
                    value: 'READ_ONLY',
                    label: 'Read Only',
                    description: 'Only can read info of records',
                  },
                  {
                    value: 'MANAGE_RECORDS',
                    label: 'Manage Records',
                    description: 'Create, Update, Read, and Delete Records',
                  },
                ],
              },
              {
                type: 'component',
                key: 'access',
                render: (props) => (
                  <AccessComponent
                    items={accessOptions}
                    clear={clearAccessComponent}
                    {...props}
                  />
                ),
              },
            ],
          }}
          hooks={{
            afterSafe,
          }}
        />
        <ModalApiKeyViewOnly
          show={showModalApiKeyViewOnly}
          apikey={lastApiKey}
          onClose={onCloseModalApiKeyViweOnly}
        ></ModalApiKeyViewOnly>
      </Layout>
    </>
  );
}

ListApiAccess.auth = { adminOnly: true };
export default ListApiAccess;
