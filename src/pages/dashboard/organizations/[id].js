import React, { useContext, useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import Metaheader from '@/components/Metaheader';
import { AppContext } from '@/contexts/AppContext';
import styles from '@/styles/Organization.module.css';
import {
  Button,
  Card,
  CardBody,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Skeleton,
  Snippet,
} from '@nextui-org/react';
import { useRouter } from 'next/router';
import MoreActionsOrganization from '@/components/Organization/MoreActionsOrganization';
import ModalSaveOrganization from '@/components/Organization/ModalSaveOrganization';
import ModalDeleteOrganization from '@/components/Organization/ModalDeleteOrganization';
import { DeleteIcon, MenuHorizontalIcon } from '@virtel/icons';

function Header({ organization, isLoading }) {
  const { state, dispatch } = useContext(AppContext);
  const [showModalSaveOrganization, setShowModalSaveOrganization] = useState(0);
  const [showModalDeleteOrganization, setShowModalDeleteOrganization] =
    useState(0);
  const onSelectRenameOrganization = (organization) => {
    setShowModalSaveOrganization((c) => c + 1);
  };

  const onSelectDeleteOrganization = (organization) => {
    setShowModalDeleteOrganization((c) => c + 1);
  };
  return (
    <>
      <div className={styles.Header}>
        <div className={styles.Title}>
          {isLoading ? (
            <Skeleton className={styles.SkeletonTitle} />
          ) : (
            <>
              <h1 className={'Title'}>{organization.name}</h1>
              <Snippet size="sm" symbol="">
                {organization.id}
              </Snippet>
            </>
          )}
        </div>
        <div className={styles.Actions}>
          {isLoading ? (
            <Skeleton className={styles.SkeletonMenu} />
          ) : (
            <>
              <Button
                color="primary"
                size="sm"
                onClick={() => {
                  dispatch({
                    type: 'CREATE_COLLECTION_ATTEMPT',
                    createCollectionAttempt: state.createCollectionAttempt + 1,
                  });
                }}
              >
                Create
              </Button>
              <MoreActionsOrganization
                organization={organization}
                onSelectRenameOrganization={onSelectRenameOrganization}
                onSelectDeleteOrganization={onSelectDeleteOrganization}
              />
            </>
          )}
        </div>
      </div>
      <ModalSaveOrganization
        show={showModalSaveOrganization}
        organization={organization}
        title={'Rename Organization'}
        onClose={() => {}}
      />
      <ModalDeleteOrganization
        show={showModalDeleteOrganization}
        organization={organization}
        onClose={() => {}}
      />
    </>
  );
}

async function getOrganization(id) {
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/organizations/get_extended?id=${id}`;
  return await fetch(url);
}

export default function OrganizationScreen() {
  const router = useRouter();
  const { state, dispatch } = useContext(AppContext);
  const [organization, setOrganization] = useState({ id: '', name: '' });
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrganization = async (id) => {
    const resp = await getOrganization(id);
    if (resp.ok) {
      const resp_json = await resp.json();
      setOrganization({
        id: resp_json.organization.id,
        name: resp_json.organization.name,
        collections: resp_json.organization.collections,
      });
      dispatch({
        type: 'SET_ORGANIZATION_SELECTED',
        organizationSelected: resp_json.organization.id,
      });
      setIsLoading(false);
    } else router.push('/dashboard/organizations');
  };
  useEffect(() => {
    if (!router.query.id) return;
    if (!state.organizations || state.organizations.length === 0) return;
    fetchOrganization(router.query.id);
  }, [state.organizations, state.organizationSelected, router.query.id]);

  const onCreateCollection = () => {};

  const getInitials = (name) => {
    if (!name || name.length < 2) {
      return 'Un';
    }
    return name.substring(0, 2);
  };

  return (
    <>
      <Metaheader title={`Organization ${organization.name} | Vidashy`} />
      <Layout theme={state.theme}>
        <div className={styles.Organizations}>
          <Header
            organization={organization}
            onCreate={onCreateCollection}
            isLoading={isLoading}
          />
          <div className={styles.Collections}>
            {organization.collections &&
              organization.collections.map((collection) => (
                <Card className={styles.SubCard} key={collection.id}>
                  <div className={styles.SubCardHeader}>
                    <Dropdown>
                      <DropdownTrigger>
                        <Button variant="flat" isIconOnly size="sm">
                          <MenuHorizontalIcon fill={'black'} size="12" />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu aria-label="Collection Actions">
                        <DropdownItem key={'id'} color={'default'}>
                          <Snippet
                            symbol=""
                            size="sm"
                            codeString={collection.id}
                          >
                            {`${collection.id.substring(0, 12)}...`}
                          </Snippet>
                        </DropdownItem>
                        <DropdownItem
                          key={'delete'}
                          color={'danger'}
                          className="text-danger"
                          startContent={<DeleteIcon fill={'#c00'} size={12} />}
                          onClick={() => {}}
                        >
                          <div className="text-12px">Delete Collection</div>
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </div>
                  <CardBody
                    className={styles.SubCardBody}
                    onClick={() => onSelectCollection(collection)}
                  >
                    <div className={styles.SubCardLeft}>
                      <div className={styles.CardIcon}>
                        {getInitials(collection.name)}
                      </div>
                    </div>
                    <div className={styles.SubCardRight}>
                      <div className={styles.SubCardName}>
                        {collection.name}
                      </div>
                      <div className={styles.SubCardType}>Base</div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            {!isLoading &&
              (!organization.collections ||
                organization.collections.length === 0) && (
                <div className={styles.NoCollections}>
                  <p>Not Collections Yet</p>
                  <Button
                    size="sm"
                    onClick={() => {
                      dispatch({
                        type: 'CREATE_COLLECTION_ATTEMPT',
                        createCollectionAttempt:
                          state.createCollectionAttempt + 1,
                      });
                    }}
                  >
                    Create Collection
                  </Button>
                </div>
              )}
          </div>
        </div>
      </Layout>
    </>
  );
}
