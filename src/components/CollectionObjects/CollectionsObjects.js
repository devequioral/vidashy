import ContextualMenu from '@/components/ContextualMenu/ContextualMenu';
import { Input, Tab, Tabs } from '@nextui-org/react';
import React, { useEffect, useRef, useState } from 'react';
import CollectionObject from './CollectionObject';
import styles from './CollectionObject.module.css';
import ModalComponent from '@/components/dashboard/ModalComponent';

const ChevronDownIcon = () => (
  <svg
    fill="none"
    height="14"
    viewBox="0 0 24 24"
    width="14"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M17.9188 8.17969H11.6888H6.07877C5.11877 8.17969 4.63877 9.33969 5.31877 10.0197L10.4988 15.1997C11.3288 16.0297 12.6788 16.0297 13.5088 15.1997L15.4788 13.2297L18.6888 10.0197C19.3588 9.33969 18.8788 8.17969 17.9188 8.17969Z"
      fill="currentColor"
    />
  </svg>
);

function TabDropDown({ item, selected, styles }) {
  const ref = useRef();
  const [contextualMenuVisible, setContextualMenuVisible] = useState(false);
  const onCloseContextualMenu = () => {
    setContextualMenuVisible(false);
  };
  const onSelectItem = (item) => {
    console.log(item);
  };
  return (
    <>
      <div ref={ref} className={styles.TabTitle}>
        <span>{item.label}</span>
        {selected === item.id && (
          <div
            className={styles.BtnToggleTabTitleMenu}
            onClick={() => setContextualMenuVisible(true)}
          >
            <ChevronDownIcon />
          </div>
        )}
      </div>
      <ContextualMenu
        show={contextualMenuVisible}
        triggerElement={ref.current}
        onClose={onCloseContextualMenu}
      >
        <div
          className={styles.TabTitleMenuItem}
          onClick={() => onSelectItem('new_file')}
        >
          New File
        </div>
        <div
          className={styles.TabTitleMenuItem}
          onClick={() => onSelectItem('update')}
        >
          Update File
        </div>
        <div
          className={styles.TabTitleMenuItem}
          onClick={() => onSelectItem('delete')}
        >
          Delete File
        </div>
      </ContextualMenu>
    </>
  );
}

async function createNewTable(name, collection) {
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/objects/new`;
  return await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      collectionId: collection.id,
      collectionName: collection.name,
      organizationId: collection.organization_id,
      objectName: name,
    }),
  });
}

export default function CollectionObjects({ collection }) {
  const [tabs, setTabs] = useState([]);
  const [selected, setSelected] = useState('');
  const [refresh, setRefresh] = useState(0);
  const [showNewTabModal, setShowNewTabModal] = useState(0);
  const [nameNewTable, setNameNewTable] = useState('');
  const [savingRecord, setSavingRecord] = useState(false);
  const [allowSave, setAllowSave] = useState(false);
  useEffect(() => {
    if (!collection) return;
    let _tabs = [];
    const objects = collection['objects'];
    objects.map((object, i) => {
      _tabs.push({
        id: object.id,
        label: object.name,
        object,
        organizationId: collection.organization_id,
        collectionName: collection.name,
        collectionId: collection.id,
      });
      if (i == 0) setSelected(object.id);
    });
    _tabs.push({
      id: 'addnew',
      label: 'Add New',
    });
    setTabs(_tabs);
  }, [collection, refresh]);

  const onSelectTab = (key) => {
    if (key !== 'addnew') setSelected(key);
    else {
      setShowNewTabModal((c) => c + 1);
    }
  };

  const createNewTab = async () => {
    setSavingRecord(true);
    const resp = await createNewTable(nameNewTable, collection);
    if (resp.ok) {
      setRefresh((c) => c + 1);
      setShowNewTabModal(0);
    }
  };

  return (
    <div className={styles.CollectionObjects}>
      <Tabs
        aria-label="Sheet Tabs"
        items={tabs}
        variant={'underlined'}
        className={styles.Tabs}
        selectedKey={selected}
        onSelectionChange={onSelectTab}
      >
        {(item) => (
          <Tab
            key={item.id}
            title={
              <TabDropDown item={item} selected={selected} styles={styles} />
            }
            className={`${styles.Tab} ${
              selected === item.id ? styles.selected : ''
            }`}
          >
            {item.object && (
              <CollectionObject
                collectionId={item.collectionId}
                collectionName={item.collectionName}
                organizationId={item.organizationId}
                object={item.object}
              />
            )}
          </Tab>
        )}
      </Tabs>
      <ModalComponent
        show={showNewTabModal}
        onSave={createNewTab}
        title={'Create New Table'}
        onCloseModal={() => {
          setNameNewTable('');
          setAllowSave(false);
          setSavingRecord(false);
        }}
        allowSave={allowSave}
        savingRecord={savingRecord}
        size={'xl'}
      >
        <Input
          type="text"
          label="Name"
          placehodlder="Enter the name of new Table"
          onChange={(e) => {
            setNameNewTable(e.target.value);
            setAllowSave(true);
          }}
        />
      </ModalComponent>
    </div>
  );
}
