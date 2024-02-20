import React from 'react';
import LoginComponent from '@/components/dashboard/LoginComponent';
import Metaheader from '@/components/Metaheader';
import style from '@/styles/LoginScreen.module.css';
import Image from 'next/image';

export default function LoginScreen() {
  return (
    <>
      <Metaheader />
      <div className={`${style.LoginScreen}`}>
        <div className={`${style.bg}`}>
          <Image
            src="/assets/images/bg-login.jpg"
            width={933}
            height={1920}
            alt=""
          />
        </div>
        <LoginComponent
          options={{
            logo: {
              src: '/assets/images/theme-light/logo.svg',
              width: 429,
              height: 79,
              alt: 'Logo',
            },
          }}
        />
      </div>
    </>
  );
}
