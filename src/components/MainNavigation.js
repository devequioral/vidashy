import { Button, ButtonGroup } from '@nextui-org/react';
import React, { useContext, useEffect, useState } from 'react';

import styles from '@/styles/MainNavigation.module.css';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { AddIcon } from '@virtel/icons';
import { AppContext } from '@/contexts/AppContext';
import Link from 'next/link';

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
            <li key={i}>
              <Link href={link.url}>{link.label}</Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default function MainNavigation() {
  const { state, dispatch } = useContext(AppContext);
  const { data: session } = useSession();
  const user = session?.user;

  const router = useRouter();
  const onClickMenu = (path) => {
    router.push(path);
  };

  const [organizationsLinks, setOrganizationsLinks] = useState([]);

  useEffect(() => {
    if (state.organizations && state.organizations.length > 0) {
      const links = [];
      state.organizations.map((org, i) => {
        links.push({
          label: org.name,
          url: `/dashboard/organizations/${org.id}`,
        });
      });
      setOrganizationsLinks(links);
    }
  }, [state.organizations]);

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
          onClick={() => {
            dispatch({
              type: 'CREATE_COLLECTION_ATTEMPT',
              createCollectionAttempt: state.createCollectionAttempt + 1,
            });
          }}
          startContent={<AddIcon fill={'#fff'} size={16} />}
        >
          Create
        </Button>
      )}
    </div>
  );
}
