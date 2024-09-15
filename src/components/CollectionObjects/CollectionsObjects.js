import ContextualMenu from '@/components/ContextualMenu/ContextualMenu';
import { Tab, Tabs } from '@nextui-org/react';
import React, { useEffect, useRef, useState } from 'react';
import CollectionObject from './CollectionObject';
import styles from './CollectionObject.module.css';

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

export default function CollectionObjects({ collection }) {
  const [tabs, setTabs] = useState([]);
  const [selected, setSelected] = useState('');
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
    setTabs(_tabs);
  }, [collection]);

  return (
    <div className={styles.CollectionObjects}>
      <Tabs
        aria-label="Sheet Tabs"
        items={tabs}
        variant={'underlined'}
        className={styles.Tabs}
        selectedKey={selected}
        onSelectionChange={setSelected}
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
            <CollectionObject
              collectionId={item.collectionId}
              collectionName={item.collectionName}
              organizationId={item.organizationId}
              object={item.object}
            />
          </Tab>
        )}
      </Tabs>
    </div>
  );
}
