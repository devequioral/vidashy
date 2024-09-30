import { Button, ButtonGroup } from '@nextui-org/react';
import React, { useEffect, useState } from 'react';

import styles from '@/styles/MainNavigation.module.css';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { AddIcon } from '@virtel/icons';

const listOrganizations = async () => {
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/organizations/list`;
  return await fetch(url);
};

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

const Collapsible = (props) => {
  const {
    buttonLabel,
    mainLink,
    onClickMenu,
    links,
    defaultState = 'collapsed',
  } = props;
  const [collapsed, setCollapsed] = useState(defaultState);
  const toggleCollapse = () => {
    setCollapsed((c) => (c === 'collapsed' ? 'expanded' : 'collapsed'));
  };
  return (
    <div className={`${styles.Collapsible}`}>
      <div className={`${styles.CollapsibleHeader}`}>
        <ButtonGroup variant="flat">
          <Button
            color="default"
            variant="light"
            className={`btn-menu ${styles.button}`}
            onClick={() => onClickMenu(mainLink)}
            startContent={
              <Image
                src={`/assets/images/theme-light/icon-organizations.svg`}
                width={24}
                height={24}
                alt={buttonLabel}
              />
            }
          >
            {buttonLabel}
          </Button>

          <Button isIconOnly variant="light" onClick={toggleCollapse}>
            <ChevronDownIcon />
          </Button>
        </ButtonGroup>
      </div>
      <div className={`${styles.CollapsibleBody} ${styles[collapsed]}`}>
        <ul>
          {links.map((link, i) => (
            <li
              key={i}
              onClick={() => {
                onClickMenu(link.url);
              }}
            >
              {link.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default function MainNavigation() {
  const { data: session } = useSession();
  const user = session?.user;

  const router = useRouter();
  const [selectedOption, setSelectedOption] = React.useState('');
  const onClickMenu = (path) => {
    router.push(path);
  };

  const onSelectOption = (option) => {
    setSelectedOption(option);
    if (option.has('collections')) return onClickMenu('/dashboard/collections');
    if (option.has('apiaccess')) return onClickMenu('/dashboard/apiaccess');
    if (option.has('automations')) return onClickMenu('/dashboard/automations');
  };

  const [organizationsLinks, setOrganizationsLinks] = useState([]);

  useEffect(() => {
    const fetchOrganizations = async () => {
      const response = await listOrganizations();
      if (response.ok) {
        const resp_json = await response.json();
        const links = [];
        if (!resp_json.data.records) return;
        resp_json.data.records.map((record, i) => {
          links.push({
            label: record.name,
            url: `/dashboard/organizations/${record.id}`,
          });
        });
        setOrganizationsLinks(links);
      }
    };
    fetchOrganizations();
  }, []);

  return (
    <div className={`${styles.MainNavigation}`}>
      <Button
        color="default"
        variant="light"
        className={`btn-menu ${styles.button}`}
        onClick={() => onClickMenu('/dashboard')}
        startContent={
          <Image
            src={`/assets/images/theme-light/icon-home.svg`}
            width={24}
            height={24}
            alt="Home"
          />
        }
      >
        Home
      </Button>

      {user && user?.role === 'admin' && (
        <Collapsible
          buttonLabel="Organizations"
          mainLink="/dashboard/organizations"
          onClickMenu={onClickMenu}
          links={organizationsLinks}
          defaultState={'expanded'}
        />
      )}
      {user && user?.role === 'admin' && (
        <Button
          color="default"
          variant="light"
          className={`btn-menu ${styles.button}`}
          onClick={() => onClickMenu('/dashboard/apiaccessv2')}
          startContent={
            <Image
              src={`/assets/images/theme-light/icon-api.svg`}
              width={24}
              height={24}
              alt="Api Access"
            />
          }
        >
          Api Access
        </Button>
      )}
      {user && user?.role === 'admin' && (
        <Button
          color="default"
          variant="light"
          className={`btn-menu ${styles.button}`}
          onClick={() => onClickMenu('/dashboard/users')}
          startContent={
            <Image
              src={`/assets/images/theme-light/icon-user.svg`}
              width={24}
              height={24}
              alt="Users"
            />
          }
        >
          Users
        </Button>
      )}
      <Button
        color="default"
        variant="light"
        className={`btn-menu ${styles.button}`}
        onClick={() => onClickMenu('/close-session')}
        startContent={
          <Image
            src={`/assets/images/theme-light/icon-exit.svg`}
            width={24}
            height={24}
            alt="menu"
          />
        }
      >
        Exit
      </Button>
      {user && user?.role === 'admin' && (
        <Button
          color="primary"
          variant="solid"
          size="sm"
          className={`${styles.BtnCreateCollection}`}
          onClick={() => {}}
          startContent={<AddIcon fill={'#fff'} size={16} />}
        >
          Create
        </Button>
      )}
    </div>
  );
}
