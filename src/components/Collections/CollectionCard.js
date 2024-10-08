import { useRouter } from 'next/router';
import React, { useContext, useState } from 'react';
import { AppContext } from '@/contexts/AppContext';
import styles from './CollectionCard.module.css';
import {
  Button,
  Card,
  CardBody,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Snippet,
} from '@nextui-org/react';
import { DeleteIcon, EditIcon, MenuHorizontalIcon } from '@virtel/icons';
import ModalDeleteCollection from './ModalDeleteCollection';

function MoreActionsCollection({ organization, collection }) {
  const { state, dispatch } = useContext(AppContext);
  const [showModalDelete, setShowModalDelete] = useState(0);
  const onRename = () => {
    dispatch({
      type: 'SET_COLLECTION_SELECTED',
      collectionSelected: { id: collection.id, name: collection.name },
    });
    dispatch({
      type: 'CREATE_COLLECTION_ATTEMPT',
      createCollectionAttempt: state.createCollectionAttempt + 1,
    });
  };
  const onDelete = () => {
    setShowModalDelete((c) => c + 1);
  };
  return (
    <>
      <Dropdown>
        <DropdownTrigger>
          <Button variant="flat" isIconOnly size="sm">
            <MenuHorizontalIcon fill={'black'} size="12" />
          </Button>
        </DropdownTrigger>
        <DropdownMenu aria-label="Collection Actions">
          <DropdownItem
            key={'rename'}
            color={'default'}
            startContent={<EditIcon fill={'#000'} size={12} />}
            onClick={onRename}
          >
            <div className="text-12px">Rename Collection</div>
          </DropdownItem>
          <DropdownItem
            key={'delete'}
            color={'danger'}
            className="text-danger"
            startContent={<DeleteIcon fill={'#c00'} size={12} />}
            onClick={onDelete}
          >
            <div className="text-12px">Delete Collection</div>
          </DropdownItem>
          <DropdownItem key={'id'} color={'default'}>
            <Snippet symbol="" size="sm" codeString={collection.id}>
              {`${collection.id.substring(0, 12)}...`}
            </Snippet>
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
      <ModalDeleteCollection
        show={showModalDelete}
        organization={organization}
        collection={collection}
        onClose={() => {}}
      />
    </>
  );
}

export default function CollectionCard({ organization, collection }) {
  const { state, dispatch } = useContext(AppContext);
  const router = useRouter();
  const onSelectCollection = (collection) => {
    router.push(`/dashboard/collections/${collection.id}`);
  };
  const getInitials = (name) => {
    if (!name || name.length < 2) {
      return 'Un';
    }
    return name.substring(0, 2);
  };
  return (
    <>
      <Card className={styles.SubCard} key={collection.id}>
        <div className={styles.SubCardHeader}>
          <MoreActionsCollection
            organization={organization}
            collection={collection}
          />
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
            <div className={styles.SubCardName}>{collection.name}</div>
            <div className={styles.SubCardType}>Base</div>
          </div>
        </CardBody>
      </Card>
    </>
  );
}
