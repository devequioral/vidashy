import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from '@nextui-org/react';
import { DeleteIcon, EditIcon, MenuHorizontalIcon } from '@virtel/icons';
import React from 'react';

export default function MoreActionsOrganization(props) {
  const {
    organization,
    onSelectRenameOrganization,
    onSelectDeleteOrganization,
  } = props;
  return (
    <>
      <Dropdown>
        <DropdownTrigger>
          <Button variant="flat" isIconOnly size="sm">
            <MenuHorizontalIcon fill={'black'} size="12" />
          </Button>
        </DropdownTrigger>
        <DropdownMenu aria-label="Organizaion Actions">
          <DropdownItem
            key={'rename'}
            color={'default'}
            startContent={<EditIcon fill={'#000'} size={12} />}
            onClick={() => onSelectRenameOrganization(organization)}
          >
            <div className="text-12px">Rename Organization</div>
          </DropdownItem>
          <DropdownItem
            key={'delete'}
            color={'danger'}
            className="text-danger"
            startContent={<DeleteIcon fill={'#c00'} size={12} />}
            onClick={() => onSelectDeleteOrganization(organization)}
          >
            <div className="text-12px">Delete Organization</div>
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </>
  );
}
