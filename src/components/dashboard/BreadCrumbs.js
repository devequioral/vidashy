import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { Breadcrumbs, BreadcrumbItem } from '@nextui-org/react';

export default function BreadCrumbs(props) {
  const { theme, data } = props;

  return (
    <>
      <Breadcrumbs>
        {data.links.map((link, index) => {
          return (
            <BreadcrumbItem key={`BreadcrumbItem-${index}`}>
              {link.href ? (
                <Link href={link.href}>{link.title}</Link>
              ) : (
                <span>{link.title}</span>
              )}
            </BreadcrumbItem>
          );
        })}
      </Breadcrumbs>
    </>
  );
}
